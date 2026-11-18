package com.mamutherd.impromptu.transcribir

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtException
import ai.onnxruntime.OrtSession
import android.content.Context
import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.datos.Pedal
import com.mamutherd.impromptu.datos.TipoPedal
import org.json.JSONObject
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.channels.FileChannel
import kotlin.coroutines.cancellation.CancellationException
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.ln1p
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Transkun V2 (Yujia Yan; código MIT) nativo con ONNX Runtime: piano con fuerza, sustain y una
 * corda. Port de packages/transcribe/src/transkun (espectro, Viterbi y unión de segmentos), que
 * a su vez sigue el original de Python línea a línea.
 *
 * Memoria (BUG-004): las salidas grandes de la red (S ocupa 172 MB por segmento) se escriben en
 * búferes directos reservados una sola vez, fuera del montón de Java, y se reutilizan.
 */
class Transkun internal constructor(
    private val env: OrtEnvironment = OrtEnvironment.getEnvironment(),
    private val red: OrtSession,
    private val cabezas: OrtSession,
    private val c: Constantes,
) : AutoCloseable {

    class Constantes(
        val fs: Int,
        val hop: Int,
        val win: Int,
        val nMels: Int,
        val eps: Double,
        val segmento: Double,
        val avance: Double,
        val simbolos: IntArray,
        /** [nWins, win] */
        val ventanas: FloatArray,
        /** [win/2+1, nMels] */
        val mel: FloatArray,
    ) {
        val nWins = ventanas.size / win
    }

    class Evento(var tecla: Int, var inicio: Double, var fin: Double, val fuerza: Int, val conInicio: Boolean, var conFin: Boolean)

    class Cancelada : CancellationException("Conversión cancelada")

    private val opcionesCorrida = OrtSession.RunOptions()
    @Volatile private var cancelada = false

    /** Detiene la corrida en curso lo antes posible (desde cualquier hilo). */
    fun cancelar() {
        cancelada = true
        runCatching { opcionesCorrida.setTerminate(true) }
    }

    override fun close() {
        runCatching { red.close() }
        runCatching { cabezas.close() }
        runCatching { opcionesCorrida.close() }
    }

    /** Transcribe audio mono a 44,1 kHz por segmentos de 16 s que avanzan de a 8 s. */
    fun transcribir(muestras: FloatArray, progreso: (Float) -> Unit): List<Evento> {
        cancelada = false
        opcionesCorrida.setTerminate(false)
        val nSym = c.simbolos.size
        val padInicio = c.segmento - c.avance
        val padMuestras = ceil(padInicio * c.fs).toInt()
        val total = muestras.size + 2 * padMuestras
        val paso = ceil(c.avance * c.fs / c.hop).toInt() * c.hop
        val largoSeg = ceil(c.segmento * c.fs).toInt()
        val ultimoCuadro = (largoSeg.toDouble() / c.hop).roundToInt()
        val durCuadro = c.hop.toDouble() / c.fs
        val T = cuadros(largoSeg, c.hop)
        var inicioForzado = IntArray(nSym) { (padInicio * c.fs / c.hop).toInt() }
        val porTipo = LinkedHashMap<Int, MutableList<Evento>>()
        val pasos = ceil(total.toDouble() / paso).toInt()

        // Búferes directos reutilizados en cada segmento.
        val entrada = directo(T * c.nMels * c.nWins)
        val bufS = directo(T * T * nSym)
        val bufSkip = directo((T - 1) * nSym)
        val bufCtx = directo(nSym * T * D)
        val tEntrada = OnnxTensor.createTensor(env, entrada, longArrayOf(1, T.toLong(), c.nMels.toLong(), c.nWins.toLong()))
        val tS = OnnxTensor.createTensor(env, bufS, longArrayOf(T.toLong(), T.toLong(), nSym.toLong()))
        val tSkip = OnnxTensor.createTensor(env, bufSkip, longArrayOf((T - 1).toLong(), nSym.toLong()))
        val tCtx = OnnxTensor.createTensor(env, bufCtx, longArrayOf(nSym.toLong(), T.toLong(), D.toLong()))
        val segmento = FloatArray(largoSeg)
        try {
            progreso(0f)
            var i = 0
            var s = 0
            while (i < total) {
                if (cancelada) throw Cancelada()
                // Segmento con el relleno de silencio al comienzo y al final.
                segmento.fill(0f)
                for (k in 0 until largoSeg) {
                    val j = i + k - padMuestras
                    if (j >= 0 && j < muestras.size) segmento[k] = muestras[j]
                }
                val inicioSeg = i.toDouble() / c.fs - padInicio
                val feats = Espectro.caracteristicas(segmento, c) { cancelada }
                entrada.clear()
                entrada.put(feats)
                entrada.rewind()
                try {
                    red.run(mapOf("features" to tEntrada), setOf(), mapOf("S" to tS, "S_skip" to tSkip, "ctx" to tCtx), opcionesCorrida).close()
                } catch (e: OrtException) {
                    if (cancelada) throw Cancelada()
                    throw e
                }
                if (cancelada) throw Cancelada()
                val intervalos = Decodificacion.viterbi(bufS, bufSkip, T, nSym, inicioForzado)
                val n = intervalos.sumOf { it.size }
                var fuerza = FloatArray(0)
                var of = FloatArray(0)
                if (n > 0) {
                    val attr = FloatArray(n * D * 3)
                    var q = 0
                    intervalos.forEachIndexed { sym, lista ->
                        for ((a, b) in lista) {
                            val base = q * D * 3
                            val ia = (sym * T + a) * D
                            val ib = (sym * T + b) * D
                            for (d in 0 until D) {
                                val va = bufCtx.get(ia + d)
                                val vb = bufCtx.get(ib + d)
                                attr[base + d] = va
                                attr[base + D + d] = vb
                                attr[base + 2 * D + d] = va * vb
                            }
                            q++
                        }
                    }
                    OnnxTensor.createTensor(env, FloatBuffer.wrap(attr), longArrayOf(n.toLong(), (D * 3).toLong())).use { tAttr ->
                        cabezas.run(mapOf("attr" to tAttr)).use { r ->
                            fuerza = (r.get("velocity").get() as OnnxTensor).floatBuffer.let { b -> FloatArray(b.remaining()).also { b.get(it) } }
                            of = (r.get("of").get() as OnnxTensor).floatBuffer.let { b -> FloatArray(b.remaining()).also { b.get(it) } }
                        }
                    }
                }
                val (notas, ultimos) = Decodificacion.notasDelSegmento(intervalos, c.simbolos, fuerza, of, durCuadro, ultimoCuadro)
                inicioForzado = IntArray(nSym) { max(ultimos[it] - paso / c.hop, 0) }
                for (e in notas) {
                    e.inicio = max(e.inicio + inicioSeg, 0.0)
                    e.fin = max(e.fin + inicioSeg, e.inicio)
                }
                Decodificacion.unir(porTipo, notas)
                s++
                progreso(s.toFloat() / pasos)
                i += paso
            }
            return Decodificacion.cerrar(porTipo)
        } finally {
            tEntrada.close()
            tS.close()
            tSkip.close()
            tCtx.close()
        }
    }

    companion object {
        /** Ancho del contexto por cuadro y símbolo (salida ctx de la red). */
        const val D = 256
        const val TASA = 44_100

        fun cuadros(largo: Int, hop: Int) = ceil(largo.toDouble() / hop).toInt() + 1

        private fun directo(n: Int): FloatBuffer =
            ByteBuffer.allocateDirect(n * 4).order(ByteOrder.nativeOrder()).asFloatBuffer()

        private fun mapear(context: Context, nombre: String): ByteBuffer =
            context.assets.openFd("modelos/$nombre").use { fd ->
                FileInputStream(fd.fileDescriptor).channel.use { ch ->
                    ch.map(FileChannel.MapMode.READ_ONLY, fd.startOffset, fd.declaredLength)
                }
            }

        private fun floats(context: Context, nombre: String): FloatArray {
            val b = mapear(context, nombre).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer()
            return FloatArray(b.remaining()).also { b.get(it) }
        }

        /** Carga la red y las constantes desde assets/modelos (mapeadas, sin copiar al montón). */
        fun cargar(context: Context): Transkun {
            val env = OrtEnvironment.getEnvironment()
            val opciones = OrtSession.SessionOptions().apply {
                setOptimizationLevel(OrtSession.SessionOptions.OptLevel.EXTENDED_OPT)
                setIntraOpNumThreads(Runtime.getRuntime().availableProcessors().coerceIn(1, 4))
            }
            val red = env.createSession(mapear(context, "transkun-red.onnx"), opciones)
            val cabezas = env.createSession(mapear(context, "transkun-cabezas.onnx"), opciones)
            val c = constantes(
                JSONObject(context.assets.open("modelos/transkun-espectro.json").bufferedReader().readText()),
                floats(context, "transkun-ventanas.f32"),
                floats(context, "transkun-mel.f32"),
            )
            return Transkun(env, red, cabezas, c)
        }

        /** Constantes del espectro (transkun-espectro.json y las tablas .f32). */
        internal fun constantes(meta: JSONObject, ventanas: FloatArray, mel: FloatArray): Constantes {
            val sims = meta.getJSONArray("symbols")
            return Constantes(
                fs = meta.getInt("fs"),
                hop = meta.getInt("hopSize"),
                win = meta.getInt("windowSize"),
                nMels = meta.optInt("nMels", 229),
                eps = meta.getDouble("eps"),
                segmento = meta.getDouble("segmentSize"),
                avance = meta.getDouble("segmentHop"),
                simbolos = IntArray(sims.length()) { sims.getInt(it) },
                ventanas = ventanas,
                mel = mel,
            )
        }

        /** Notas y pedales para una pieza: -64 es el sustain y -67 la una corda. */
        fun aPieza(eventos: List<Evento>): Pair<List<Nota>, List<Pedal>> {
            val notas = eventos.filter { it.tecla >= 0 && it.fin > it.inicio }
                .map { Nota(it.tecla, it.inicio, it.fin, it.fuerza.coerceIn(1, 127)) }
            val pedales = eventos.mapNotNull { e ->
                val tipo = when (e.tecla) { -64 -> TipoPedal.Sustain; -67 -> TipoPedal.UnaCorda; else -> null } ?: return@mapNotNull null
                listOf(Pedal(tipo, e.inicio, 127), Pedal(tipo, e.fin, 0))
            }.flatten().sortedBy { it.tiempo }
            return notas to pedales
        }
    }
}

/** Características log-mel de Transkun: [T, nMels, nWins] (cuadro, banda, ventana). */
object Espectro {
    fun caracteristicas(seg: FloatArray, c: Transkun.Constantes, cancelada: () -> Boolean): FloatArray {
        val hop = c.hop
        val win = c.win
        val nMels = c.nMels
        val nWins = c.nWins
        val nBins = win / 2 + 1
        val largo = seg.size
        val T = Transkun.cuadros(largo, hop)
        val lPad = win / 2
        fun muestra(t: Int, k: Int): Float {
            val i = t * hop + k - lPad
            return if (i in 0 until largo) seg[i] else 0f
        }
        // Normalización de ganancia sobre todos los cuadros (con sus solapes), std insesgada.
        var suma = 0.0
        var sumaCuad = 0.0
        for (t in 0 until T) for (k in 0 until win) {
            val v = muestra(t, k).toDouble()
            suma += v
            sumaCuad += v * v
        }
        val n = T.toDouble() * win
        val media = suma / n
        val std = sqrt(max(0.0, (sumaCuad - n * media * media) / (n - 1)))
        val escala = 1.0 / (std + 1e-8)

        val cosT = DoubleArray(win / 2) { cos(2 * PI * it / win) }
        val sinT = DoubleArray(win / 2) { sin(2 * PI * it / win) }
        val re = DoubleArray(win)
        val im = DoubleArray(win)
        val cuadro = DoubleArray(win)
        val potencia = DoubleArray(nBins)
        val out = FloatArray(T * nMels * nWins)
        val logEps = ln(c.eps)
        val rangos = Array(nMels) { m ->
            var lo = nBins
            var hi = -1
            for (b in 0 until nBins) if (c.mel[b * nMels + m] != 0f) { lo = min(lo, b); hi = b }
            lo to hi
        }
        for (t in 0 until T) {
            if (t % 32 == 0 && cancelada()) throw Transkun.Cancelada()
            for (k in 0 until win) cuadro[k] = (muestra(t, k) - media) * escala
            for (w in 0 until nWins) {
                for (k in 0 until win) {
                    re[k] = cuadro[k] * c.ventanas[w * win + k]
                    im[k] = 0.0
                }
                fft(re, im, cosT, sinT)
                for (b in 0 until nBins) potencia[b] = (re[b] * re[b] + im[b] * im[b]) / win
                for (m in 0 until nMels) {
                    var mel = 0.0
                    val (lo, hi) = rangos[m]
                    for (b in lo..hi) mel += potencia[b] * c.mel[b * nMels + m]
                    out[(t * nMels + m) * nWins + w] = ((ln(mel + c.eps) - logEps) / -logEps).toFloat()
                }
            }
        }
        return out
    }

    /** FFT compleja radix-2 en el lugar. */
    fun fft(re: DoubleArray, im: DoubleArray, cosT: DoubleArray, sinT: DoubleArray) {
        val n = re.size
        var j = 0
        for (i in 1 until n) {
            var bit = n shr 1
            while (j and bit != 0) { j = j xor bit; bit = bit shr 1 }
            j = j xor bit
            if (i < j) {
                var x = re[i]; re[i] = re[j]; re[j] = x
                x = im[i]; im[i] = im[j]; im[j] = x
            }
        }
        var size = 2
        while (size <= n) {
            val half = size shr 1
            val step = n / size
            var start = 0
            while (start < n) {
                for (k in 0 until half) {
                    val cs = cosT[k * step]
                    val sn = sinT[k * step]
                    val a = start + k
                    val b = a + half
                    val tr = re[b] * cs + im[b] * sn
                    val ti = im[b] * cs - re[b] * sn
                    re[b] = re[a] - tr
                    im[b] = im[a] - ti
                    re[a] += tr
                    im[a] += ti
                }
                start += size
            }
            size = size shl 1
        }
    }
}

/** Viterbi del semi-CRF de intervalos, lectura de cabezas y unión de segmentos. */
object Decodificacion {
    /** `S`: [T, T, nSym] (S[fin][inicio][símbolo]); `skip`: [T-1, nSym]. */
    fun viterbi(S: FloatBuffer, skip: FloatBuffer, T: Int, nSym: Int, forzado: IntArray): List<List<Pair<Int, Int>>> {
        fun at(fin: Int, ini: Int, s: Int) = S.get((fin * T + ini) * nSym + s)
        val q = DoubleArray(T)
        val ptr = IntArray(T)
        return List(nSym) { s ->
            val ultimo = at(T - 1, T - 1, s)
            q.fill(0.0)
            q[T - 1] = if (ultimo > 0) ultimo.toDouble() else 0.0
            for (i in 1 until T) {
                val pos = T - i - 1
                var mejor = q[pos + 1] + skip.get(pos * nSym + s)
                var sel = 0
                for (k in 0 until i) {
                    val v = q[pos + 1 + k] + at(pos + 1 + k, pos, s)
                    if (v > mejor) { mejor = v; sel = k + 1 }
                }
                ptr[i - 1] = sel - 1
                val diag = at(pos, pos, s)
                q[pos] = mejor + (if (diag > 0) diag else 0f)
            }
            val lista = ArrayList<Pair<Int, Int>>()
            var j = forzado[s]
            while (j < T - 1) {
                val sel = ptr[T - j - 2]
                if (at(j, j, s) > 0) lista += j to j
                if (sel < 0) j += 1 else {
                    val i = sel + j + 1
                    lista += j to i
                    j = i
                }
            }
            if (ultimo > 0) lista += (T - 1) to (T - 1)
            lista
        }
    }

    /** Media de una Bernoulli continua con estos logits (como torch.distributions). */
    fun mediaBernoulliContinua(logit: Float): Double {
        val p = 1 / (1 + exp(-logit.toDouble()))
        if (p < 0.499 || p > 0.501) return p / (2 * p - 1) + 1 / (ln1p(-p) - ln(p))
        val x = p - 0.5
        return 0.5 + (1.0 / 3 + 16.0 / 45 * x * x) * x
    }

    fun notasDelSegmento(
        intervalos: List<List<Pair<Int, Int>>>,
        simbolos: IntArray,
        fuerza: FloatArray,
        of: FloatArray,
        durCuadro: Double,
        ultimoCuadro: Int,
    ): Pair<List<Transkun.Evento>, IntArray> {
        val notas = ArrayList<Transkun.Evento>()
        val ultimos = IntArray(intervalos.size)
        var n = 0
        intervalos.forEachIndexed { s, lista ->
            var finAnterior = 0.0
            var ultimo = 0
            for ((a, b) in lista) {
                var vel = 0
                for (v in 1 until 128) if (fuerza[n * 128 + v] > fuerza[n * 128 + vel]) vel = v
                fun ajuste(k: Int) = ((mediaBernoulliContinua(of[n * 4 + k]) - 0.5) / 0.99).coerceIn(-0.5, 0.5)
                var inicio = (a + ajuste(0)) * durCuadro
                var fin = (b + ajuste(1)) * durCuadro
                val conInicio = a > 0 || of[n * 4 + 2] > 0
                val conFin = b < ultimoCuadro || of[n * 4 + 3] > 0
                inicio = max(inicio, finAnterior)
                fin = max(fin, inicio + 1e-8)
                finAnterior = fin
                notas += Transkun.Evento(simbolos[s], inicio, fin, vel, conInicio, conFin)
                if (conFin) ultimo = b
                n++
            }
            ultimos[s] = ultimo
        }
        notas.sortWith(compareBy({ it.inicio }, { it.fin }, { it.tecla }))
        return notas to ultimos
    }

    fun unir(porTipo: MutableMap<Int, MutableList<Transkun.Evento>>, segmento: List<Transkun.Evento>) {
        for (e in segmento) {
            val lista = porTipo.getOrPut(e.tecla) { ArrayList() }
            val ultimo = lista.lastOrNull()
            if (ultimo != null && e.inicio < ultimo.fin) {
                if (e.conInicio) lista[lista.size - 1] = e
                else {
                    ultimo.conFin = e.conFin
                    ultimo.fin = max(e.fin, ultimo.fin)
                }
                continue
            }
            if (e.conInicio) lista += e
        }
    }

    fun cerrar(porTipo: Map<Int, MutableList<Transkun.Evento>>): List<Transkun.Evento> {
        for (l in porTipo.values) l.lastOrNull()?.conFin = true
        val todos = porTipo.values.flatten().filter { it.conFin }
            .sortedWith(compareBy({ it.inicio }, { it.fin }, { it.tecla }))
        val ultimoPorTecla = HashMap<Int, Transkun.Evento>()
        for (e in todos) {
            ultimoPorTecla[e.tecla]?.let { if (it.fin > e.inicio) it.fin = e.inicio }
            ultimoPorTecla[e.tecla] = e
        }
        return todos.filter { it.inicio < it.fin }.sortedWith(compareBy({ it.inicio }, { it.fin }, { it.tecla }))
    }
}
