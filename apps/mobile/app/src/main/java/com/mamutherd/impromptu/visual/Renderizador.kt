package com.mamutherd.impromptu.visual

import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.datos.Pedal
import com.mamutherd.impromptu.datos.TipoPedal
import com.mamutherd.impromptu.datos.esNegra
import com.mamutherd.impromptu.instrumentos.Bateria
import com.mamutherd.impromptu.instrumentos.Instrumento

/**
 * Visualizador de notas cayendo, tema "Ámbar" (DESIGN §2): mano derecha ámbar, izquierda
 * chasis, fondo #111110. Dibuja sobre un Canvas de Android: el mismo código sirve para la
 * pantalla (Compose) y para exportar el video (superficie del codificador).
 */
class Renderizador {
    private val fondo = Paint().apply { color = 0xFF111110.toInt() }
    private val derecha = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFFF9F1C.toInt() }
    private val izquierda = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFE8E4DC.toInt() }
    private val blanca = Paint().apply { color = 0xFFE8E4DC.toInt() }
    private val negra = Paint().apply { color = 0xFF1C1C1A.toInt() }
    private val borde = Paint().apply { color = 0xFF9A968C.toInt() }
    private val linea = Paint().apply { color = 0xFF2A2A27.toInt() }
    private val ambar = Paint().apply { color = 0xFFFF9F1C.toInt() }
    private val ambarSuave = Paint().apply { color = 0x66FF9F1C }
    private val izqSuave = Paint().apply { color = 0x66E8E4DC }
    private val texto = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFA39F95.toInt() }
    private val rect = RectF()
    private var brillo: Paint? = null
    private var brilloAlto = 0f

    /** Teclas visibles y su posición, recalculadas solo si cambia el tamaño o el rango. */
    private var cacheAncho = -1f
    private var cacheRango = IntRange.EMPTY
    private val x0 = FloatArray(128)
    private val x1 = FloatArray(128)

    private fun geometria(ancho: Float, rango: IntRange) {
        if (ancho == cacheAncho && rango == cacheRango) return
        cacheAncho = ancho
        cacheRango = rango
        val blancas = rango.count { !esNegra(it) }
        val w = ancho / blancas
        var i = 0
        for (t in rango) {
            if (!esNegra(t)) {
                x0[t] = i * w
                x1[t] = (i + 1) * w
                i++
            }
        }
        for (t in rango) {
            if (esNegra(t)) {
                val centro = x0[t + 1].takeIf { t + 1 in rango } ?: (i * w)
                x0[t] = centro - w * 0.31f
                x1[t] = centro + w * 0.31f
            }
        }
    }

    class Opciones(
        /** Segundos de notas que se ven sobre el teclado. */
        val ventana: Double = 3.0,
        /** En la grabación las notas suben (salen del teclado) en vez de caer. */
        val subiendo: Boolean = false,
        /** Pedal grande y visible (ADR-017). */
        val pedalGrande: Boolean = true,
        /** Guitarra, bajo o batería (fase 9): mástil o parches en vez del teclado. */
        val instrumento: Instrumento = Instrumento.Piano,
        /** Batería: vista de batería real en vez de carriles (pedido 17). */
        val vistaKit: Boolean = false,
        /** Guitarra: panel de rasgueo a la derecha (pedido 31). */
        val rasgueo: Boolean = true,
        /** Pedido 59/64: estilo de las notas, colores de cada mano y curva (0 a 1). */
        val estilo: EstiloNota = EstiloNota.Vidrio,
        val colorDerecha: Int = 0xFFFF9F1C.toInt(),
        val colorIzquierda: Int = 0xFFE8E4DC.toInt(),
        val redondeo: Float = 0.3f,
    )

    private val pintor = PintorNotas()

    /**
     * `notas` ordenadas por inicio (una nota con fin < 0 sigue apretada). `abajo`: teclas
     * apretadas en vivo, o null para calcularlas de las notas.
     */
    fun dibujar(
        c: Canvas,
        ancho: Float,
        alto: Float,
        notas: List<Nota>,
        pedales: List<Pedal>,
        t: Double,
        rango: IntRange,
        abajo: BooleanArray? = null,
        sustainVivo: Boolean? = null,
        op: Opciones = Opciones(),
    ) {
        if (op.instrumento != Instrumento.Piano) {
            dibujarCarriles(c, ancho, alto, notas, t, op)
            return
        }
        geometria(ancho, rango)
        val altoTeclado = (alto * 0.18f).coerceIn(48f, ancho * 0.12f)
        val tope = alto - altoTeclado
        val pps = tope / op.ventana.toFloat() // píxeles por segundo
        // Pedido 59: los colores y el estilo que eligió el usuario (el tema Claro trae los suyos).
        val claro = op.estilo == EstiloNota.Claro
        derecha.color = if (claro) DERECHA_CLARO else op.colorDerecha
        izquierda.color = if (claro) IZQUIERDA_CLARO else op.colorIzquierda
        fondo.color = if (claro) FONDO_CLARO else 0xFF111110.toInt()
        val escala = (alto / 1080f).coerceAtLeast(0.5f)
        c.drawRect(0f, 0f, ancho, alto, fondo)

        // Líneas de Do como guía.
        for (k in rango) if (k % 12 == 0) c.drawRect(x0[k], 0f, x0[k] + 1f, tope, linea)

        // Teclas encendidas por las notas que suenan ahora.
        val encendida = IntArray(128) // 0 no, 1 der, 2 izq

        val desde = if (op.subiendo) t - op.ventana else t - 0.5
        val hasta = if (op.subiendo) t else t + op.ventana
        // Las notas están ordenadas por inicio: se busca la primera que podría verse.
        val primera = primeraVisible(notas, desde - 30)
        for (i in primera until notas.size) {
            val n = notas[i]
            if (n.inicio > hasta) break
            val fin = if (n.fin < 0) t else n.fin
            if (fin < desde || n.tecla !in rango) continue
            val der = (n.mano ?: if (n.tecla >= 60) "R" else "L") == "R"
            val p = if (der) derecha else izquierda
            val y0: Float
            val y1: Float
            if (op.subiendo) {
                y0 = tope - ((t - n.inicio) * pps).toFloat()
                y1 = tope - ((t - fin) * pps).toFloat()
                rect.set(x0[n.tecla] + 1.5f, minOf(y0, y1) , x1[n.tecla] - 1.5f, maxOf(y0, y1).coerceAtMost(tope))
            } else {
                y1 = tope - ((n.inicio - t) * pps).toFloat()
                y0 = tope - ((fin - t) * pps).toFloat()
                rect.set(x0[n.tecla] + 1.5f, y0, x1[n.tecla] - 1.5f, minOf(y1, tope))
            }
            if (op.estilo.delgadez < 1f) {
                val angosto = rect.width() * op.estilo.delgadez
                val cx = rect.centerX()
                rect.left = cx - angosto / 2
                rect.right = cx + angosto / 2
            }
            if (rect.height() > 0.5f) {
                pintor.nota(c, rect, p.color, op.estilo, t, i, tope, op.redondeo, escala, ancho / 2)
            }
            if (n.inicio <= t && fin > t) encendida[n.tecla] = if (der) 1 else 2
        }

        // Brillo sobre el teclado.
        if (brillo == null || brilloAlto != tope) {
            brilloAlto = tope
            brillo = Paint().apply {
                shader = LinearGradient(0f, tope - 24f, 0f, tope, 0x00FF9F1C, 0x55FF9F1C, Shader.TileMode.CLAMP)
            }
        }

        // Teclado.
        val yN = tope + altoTeclado * 0.62f
        c.drawRect(0f, tope, ancho, alto, negra)
        c.drawRect(0f, tope, ancho, tope + 3f, ambar)
        for (k in rango) {
            if (esNegra(k)) continue
            val on = abajo?.get(k) == true || encendida[k] != 0
            val p = when {
                !on -> blanca
                encendida[k] == 2 && abajo?.get(k) != true -> izquierda
                else -> derecha
            }
            c.drawRect(x0[k] + 1f, tope + 3f, x1[k] - 1f, alto, if (on) p else blanca)
            if (on) c.drawRect(x0[k], tope - 24f, x1[k], tope, brillo!!)
        }
        for (k in rango) {
            if (!esNegra(k)) continue
            val on = abajo?.get(k) == true || encendida[k] != 0
            c.drawRect(x0[k], tope + 3f, x1[k], yN, if (!on) negra else if (encendida[k] == 2) izquierda else ambar)
            if (!on) c.drawRect(x0[k] + 2f, yN - 5f, x1[k] - 2f, yN - 2f, borde.also { it.alpha = 90 })
        }

        // Pedal de sustain: una barra ámbar sobre el teclado mientras está pisado.
        val pisado = sustainVivo ?: pedalAbajo(pedales, t)
        if (pisado) {
            val grosor = if (op.pedalGrande) 6f else 3f
            c.drawRect(0f, tope - grosor, ancho, tope, ambar)
            if (op.pedalGrande) {
                texto.textSize = (altoTeclado * 0.18f).coerceIn(10f, 22f)
                c.drawText("PEDAL", 12f, tope - grosor - 8f, texto.also { it.color = 0xFFFF9F1C.toInt() })
            }
        } else {
            c.drawRect(0f, tope - 1f, ancho, tope, ambarSuave)
        }
    }

    private fun primeraVisible(notas: List<Nota>, desde: Double): Int {
        var lo = 0
        var hi = notas.size
        while (lo < hi) {
            val m = (lo + hi) ushr 1
            if (notas[m].inicio < desde) lo = m + 1 else hi = m
        }
        return lo
    }

    private fun pedalAbajo(pedales: List<Pedal>, t: Double): Boolean {
        var abajo = false
        for (p in pedales) {
            if (p.tiempo > t) break
            if (p.tipo == TipoPedal.Sustain) abajo = p.abajo
        }
        return abajo
    }

    // ---- Guitarra, bajo y batería (fases 9 y 11), como packages/render ----

    private val pinta = Paint(Paint.ANTI_ALIAS_FLAG)
    private val textoCarril = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER }
    private var notasTrastes: List<Nota>? = null
    private var maxTraste = 12
    private var notasRasgueo: List<Nota>? = null
    private var golpes: List<Rasgueo.Golpe> = emptyList()
    private val camino = android.graphics.Path()

    private val colorCuerda = longArrayOf(0xFFFF9F1C, 0xFFFFD27A, 0xFFE8E4DC, 0xFF7FD1B9, 0xFF6FA8FF, 0xFFC58BFF)

    /** Vista de batería real (pedido 17): x, y en fracción del cuadro y radio en fracción del lado menor. */
    private val kitReal = mapOf(
        "hihat-pie" to floatArrayOf(0.08f, 0.88f, 0.05f),
        "hihat" to floatArrayOf(0.18f, 0.62f, 0.075f),
        "crash" to floatArrayOf(0.28f, 0.40f, 0.085f),
        "caja" to floatArrayOf(0.37f, 0.76f, 0.075f),
        "tom-agudo" to floatArrayOf(0.46f, 0.56f, 0.06f),
        "bombo" to floatArrayOf(0.55f, 0.86f, 0.10f),
        "tom-medio" to floatArrayOf(0.64f, 0.56f, 0.065f),
        "tom-piso" to floatArrayOf(0.76f, 0.76f, 0.085f),
        "ride" to floatArrayOf(0.88f, 0.48f, 0.095f),
    )

    private fun dibujarCarriles(c: Canvas, ancho: Float, alto: Float, notas: List<Nota>, t: Double, op: Opciones) {
        val bateria = op.instrumento == Instrumento.Bateria
        if (bateria && op.vistaKit && !op.subiendo) {
            dibujarKit(c, ancho, alto, notas, t, op)
            return
        }
        val altoBase = (alto * 0.2f).coerceIn(56f, ancho * 0.16f)
        val tope = alto - altoBase
        val pps = tope / op.ventana.toFloat()
        val escala = alto / 1080f
        c.drawRect(0f, 0f, ancho, alto, fondo)
        val cuerdas = if (op.instrumento == Instrumento.Bajo) 4 else 6
        if (!bateria && notasTrastes !== notas) {
            notasTrastes = notas
            maxTraste = notas.maxOfOrNull { it.traste ?: 0 } ?: 0
        }
        // Panel de rasgueo a la derecha (pedido 31): el mástil deja esa franja.
        if (op.instrumento == Instrumento.Guitarra && notasRasgueo !== notas) {
            notasRasgueo = notas
            golpes = Rasgueo.detectar(notas)
        }
        val conPanel = op.instrumento == Instrumento.Guitarra && op.rasgueo && golpes.isNotEmpty() && !op.subiendo
        val anchoMastil = if (conPanel) ancho * 0.91f else ancho
        val columnas = if (bateria) Bateria.PIEZAS.size else minOf(22, maxOf(12, maxTraste + 2)) + 1
        val col = anchoMastil / columnas
        val sub = col / cuerdas
        val activas = HashMap<Int, Long>() // carril o traste*cuerdas+cuerda → color
        val desde = if (op.subiendo) t - op.ventana else t - 0.5
        val hasta = if (op.subiendo) t else t + op.ventana
        val altoGema = maxOf(10f, 20f * escala)
        for (k in 0..columnas) c.drawRect(k * col, 0f, k * col + 1f, tope, linea)
        for (n in notas) {
            if (n.inicio > hasta) break
            val fin0 = if (n.fin < 0) t else n.fin
            val fin = if (bateria) n.inicio + 0.12 else fin0
            if (fin < desde) continue
            val yInicio = if (op.subiendo) tope - ((t - n.inicio) * pps).toFloat() else tope - ((n.inicio - t) * pps).toFloat()
            if (bateria) {
                // Gemas de alto fijo (pedidos 15 y 16); el hi-hat abierto, hueca (pedido 30).
                val carril = Bateria.carril(n.tecla)
                if (carril < 0) continue
                val p = Bateria.PIEZAS[carril]
                val w = col * (0.42f + 0.22f * n.fuerza / 127f)
                val x = carril * col + (col - w) / 2
                val y = if (op.subiendo) yInicio else yInicio - altoGema
                if (y < tope && y + altoGema > 0f && n.inicio >= desde) {
                    rect.set(x, y, x + w, minOf(y + altoGema, tope))
                    pinta.color = p.color.toInt()
                    if (n.tecla == Bateria.HIHAT_ABIERTO) {
                        pinta.style = Paint.Style.STROKE
                        pinta.strokeWidth = maxOf(3f, 5f * escala)
                        c.drawRoundRect(rect, altoGema / 2, altoGema / 2, pinta)
                        pinta.style = Paint.Style.FILL
                    } else {
                        pinta.alpha = (140 + 115 * n.fuerza / 127).coerceAtMost(255)
                        c.drawRoundRect(rect, altoGema / 2, altoGema / 2, pinta)
                        pinta.alpha = 255
                    }
                }
                if (n.inicio <= t && fin > t) activas[carril] = p.color
                continue
            }
            val cuerda = n.cuerda ?: continue
            val traste = n.traste ?: continue
            if (traste >= columnas) continue
            val x = traste * col + (cuerdas - cuerda) * sub + 1f
            val w = maxOf(2f, sub - 2f)
            val color = colorCuerda[(cuerda - 1) % 6]
            val yFin = if (op.subiendo) tope - ((t - fin) * pps).toFloat() else tope - ((fin - t) * pps).toFloat()
            rect.set(x, minOf(yInicio, yFin), x + w, maxOf(yInicio, yFin).coerceAtMost(tope))
            if (rect.height() > 0.5f) {
                pinta.color = color.toInt()
                c.drawRoundRect(rect, minOf(w, 8f) * 0.4f, minOf(w, 8f) * 0.4f, pinta)
                // Número de traste en un círculo del color de la cuerda (pedido 15).
                val d = maxOf(18f, 30f * escala)
                val cy = if (op.subiendo) rect.top + d / 2 else rect.bottom - d / 2
                c.drawCircle(rect.centerX(), cy, d / 2, pinta)
                textoCarril.textSize = d * (if (traste > 9) 0.5f else 0.6f)
                textoCarril.color = if (cuerda in 1..3) 0xFF1C1C1A.toInt() else 0xFFF5F2EC.toInt()
                c.drawText(traste.toString(), rect.centerX(), cy + textoCarril.textSize * 0.35f, textoCarril)
            }
            if (n.inicio <= t && fin > t) activas[traste * cuerdas + (cuerda - 1)] = color
        }
        // Base: mástil o parches.
        c.drawRect(0f, tope, ancho, alto, negra)
        if (bateria) {
            for ((i, p) in Bateria.PIEZAS.withIndex()) {
                val cx = (i + 0.5f) * col
                val cy = tope + altoBase * 0.5f
                val r = minOf(col * 0.42f, altoBase * 0.4f) * (if (i in activas) 1.08f else 1f)
                dibujarParche(c, cx, cy, r, 0.8f, p, i in activas, minOf(col * 0.13f, altoBase * 0.14f).coerceAtLeast(9f), altoBase * 0.03f)
            }
        } else {
            pinta.color = 0xFF2B2017.toInt()
            c.drawRect(0f, tope, anchoMastil, alto, pinta)
            pinta.color = 0xFF5A4A3A.toInt()
            for (f in intArrayOf(3, 5, 7, 9, 12, 15, 17, 19, 21)) {
                if (f >= columnas) continue
                val x = (f + 0.5f) * col
                val r = minOf(col, altoBase) * 0.07f
                if (f == 12) {
                    c.drawCircle(x, tope + altoBase * 0.3f, r, pinta)
                    c.drawCircle(x, tope + altoBase * 0.7f, r, pinta)
                } else c.drawCircle(x, tope + altoBase * 0.5f, r, pinta)
            }
            for (f in 1 until columnas) {
                val g = if (f == 1) maxOf(4f, col * 0.08f) else maxOf(2f, col * 0.04f)
                pinta.color = (if (f == 1) 0xFFE8E4DC else 0xFF9A968C).toInt()
                c.drawRect(f * col - g / 2, tope, f * col + g / 2, alto, pinta)
            }
            fun fila(cuerda: Int) = tope + altoBase * (cuerda - 0.5f) / cuerdas
            pinta.color = 0xFFD8D4CC.toInt()
            for (s in 1..cuerdas) {
                val g = maxOf(1f, (0.6f + s * 0.35f) * (altoBase / 160f))
                c.drawRect(0f, fila(s) - g / 2, anchoMastil, fila(s) + g / 2, pinta)
            }
            for ((clave, color) in activas) {
                val traste = clave / cuerdas
                val cuerda = clave % cuerdas + 1
                pinta.color = color.toInt()
                c.drawCircle((traste + 0.5f) * col, fila(cuerda), minOf(col * 0.38f, altoBase / cuerdas * 0.42f), pinta)
            }
        }
        c.drawRect(0f, tope, ancho, tope + 3f, ambar)
        if (conPanel) dibujarPanelRasgueo(c, anchoMastil, ancho, alto, tope, pps, t, escala)
    }

    /** Un parche o platillo con su nombre; se enciende con el color de la pieza al sonar. */
    private fun dibujarParche(c: Canvas, cx: Float, cy: Float, r: Float, achatado: Float, p: Bateria.Pieza, activa: Boolean, tamTexto: Float, borde: Float) {
        pinta.style = Paint.Style.FILL
        pinta.color = if (activa) p.color.toInt() else 0xFF2E2E2B.toInt()
        c.drawOval(cx - r, cy - r * achatado, cx + r, cy + r * achatado, pinta)
        pinta.color = p.color.toInt()
        pinta.style = Paint.Style.STROKE
        pinta.strokeWidth = maxOf(2f, borde)
        c.drawOval(cx - r, cy - r * achatado, cx + r, cy + r * achatado, pinta)
        pinta.style = Paint.Style.FILL
        textoCarril.textSize = tamTexto
        textoCarril.color = (if (activa) 0xFF1C1C1A else 0xFFE8E4DC).toInt()
        c.drawText(p.nombre, cx, cy + tamTexto * 0.35f, textoCarril)
    }

    /** Batería real (pedido 17): cada pieza en su lugar y los golpes bajan hasta ella. */
    private fun dibujarKit(c: Canvas, ancho: Float, alto: Float, notas: List<Nota>, t: Double, op: Opciones) {
        c.drawRect(0f, 0f, ancho, alto, fondo)
        val escala = alto / 1080f
        val menor = minOf(ancho, alto)
        val pps = alto / op.ventana.toFloat()
        val altoGema = maxOf(10f, 20f * escala)
        fun pieza(i: Int): FloatArray? {
            val k = kitReal[Bateria.PIEZAS[i].id] ?: return null
            return floatArrayOf(k[0] * ancho, k[1] * alto, minOf(k[2] * menor, 0.042f * ancho))
        }
        val activas = HashSet<Int>()
        for (n in notas) {
            if (n.inicio > t + op.ventana * 1.2) break
            val carril = Bateria.carril(n.tecla)
            if (carril < 0) continue
            if (n.inicio <= t && t < n.inicio + 0.12) activas += carril
            if (n.inicio < t) continue
            val p = pieza(carril) ?: continue
            val fondoGema = p[1] - ((n.inicio - t) * pps).toFloat()
            if (fondoGema <= 0f) continue
            val w = p[2] * (1.1f + 0.5f * n.fuerza / 127f)
            rect.set(p[0] - w / 2, fondoGema - altoGema, p[0] + w / 2, fondoGema)
            pinta.color = Bateria.PIEZAS[carril].color.toInt()
            if (n.tecla == Bateria.HIHAT_ABIERTO) {
                pinta.style = Paint.Style.STROKE
                pinta.strokeWidth = maxOf(3f, 5f * escala)
                c.drawRoundRect(rect, altoGema / 2, altoGema / 2, pinta)
                pinta.style = Paint.Style.FILL
            } else c.drawRoundRect(rect, altoGema / 2, altoGema / 2, pinta)
        }
        for (i in Bateria.PIEZAS.indices) {
            val p = pieza(i) ?: continue
            val pz = Bateria.PIEZAS[i]
            val platillo = pz.id in setOf("hihat", "hihat-pie", "ride", "crash")
            val r = p[2] * (if (i in activas) 1.06f else 1f)
            dibujarParche(c, p[0], p[1], r, if (platillo) 0.55f else 0.85f, pz, i in activas, (r * 0.32f).coerceIn(9f, 16f * maxOf(1f, escala)), r * 0.07f)
        }
    }

    /** Panel de rasgueo (pedido 31): las flechas bajan hasta el cuadro de la línea de golpe. */
    private fun dibujarPanelRasgueo(c: Canvas, x0: Float, ancho: Float, alto: Float, linea: Float, pps: Float, t: Double, escala: Float) {
        val w = ancho - x0
        val cx = x0 + w / 2
        pinta.color = 0xF0141413.toInt()
        c.drawRect(x0, 0f, ancho, alto, pinta)
        pinta.color = 0xFF3D3D39.toInt()
        c.drawRect(x0, 0f, x0 + maxOf(1f, 2f * escala), alto, pinta)
        val lado = minOf(w * 0.6f, 64f * maxOf(escala, 0.5f))
        val caja = lado * 1.3f
        var activo: Rasgueo.Golpe? = null
        var siguiente: Rasgueo.Golpe? = null
        for (g in golpes) {
            if (g.tiempo <= t && t - g.tiempo < 0.22) activo = g
            if (g.tiempo > t) { siguiente = g; break }
        }
        fun color(g: Rasgueo.Golpe) = if (g.abajo) 0xFFFF9F1C.toInt() else 0xFF7FD1B9.toInt()
        rect.set(cx - caja / 2, linea - caja / 2, cx + caja / 2, linea + caja / 2)
        pinta.color = activo?.let { color(it) and 0x66FFFFFF } ?: 0xFF232321.toInt()
        c.drawRoundRect(rect, 6f * escala, 6f * escala, pinta)
        pinta.style = Paint.Style.STROKE
        pinta.strokeWidth = maxOf(2f, 3f * escala)
        pinta.color = activo?.let { color(it) } ?: 0xFF5A5A55.toInt()
        c.drawRoundRect(rect, 6f * escala, 6f * escala, pinta)
        pinta.style = Paint.Style.FILL
        val span = linea / pps
        for (g in golpes) {
            if (g.tiempo < t) continue
            if (g.tiempo > t + span) break
            flecha(c, cx, linea - ((g.tiempo - t) * pps).toFloat(), lado, g.abajo, color(g))
        }
        activo?.let { flecha(c, cx, linea, lado * 1.1f, it.abajo, color(it)) }
        val ahora = activo ?: siguiente?.takeIf { it.tiempo - t < 0.6 }
        textoCarril.textSize = maxOf(12f, 19f * escala)
        textoCarril.color = ahora?.let { color(it) } ?: 0xFF9A968C.toInt()
        c.drawText(
            when { ahora == null -> "Silencio"; ahora.abajo -> "Abajo"; else -> "Arriba" },
            cx, linea + caja / 2 + textoCarril.textSize + 4f, textoCarril,
        )
    }

    private fun flecha(c: Canvas, cx: Float, cy: Float, lado: Float, abajo: Boolean, color: Int) {
        val h = lado / 2
        val ancho = lado * 0.22f
        val punta = lado * 0.5f
        pinta.color = color
        camino.reset()
        if (abajo) {
            c.drawRect(cx - ancho / 2, cy - h, cx + ancho / 2, cy + h - punta, pinta)
            camino.moveTo(cx - h, cy + h - punta); camino.lineTo(cx + h, cy + h - punta); camino.lineTo(cx, cy + h)
        } else {
            c.drawRect(cx - ancho / 2, cy - h + punta, cx + ancho / 2, cy + h, pinta)
            camino.moveTo(cx - h, cy - h + punta); camino.lineTo(cx + h, cy - h + punta); camino.lineTo(cx, cy - h)
        }
        camino.close()
        c.drawPath(camino, pinta)
    }
}
