import java.util.Properties
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

// Firma de lanzamiento (Mamut Herd): la llave y su contraseña viven fuera del repositorio, en D:.
val keystoreProps = Properties().apply {
    val f = file(System.getenv("IMPROMPTU_KEYSTORE") ?: "D:/Android/keys/impromptu-release.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "com.mamutherd.impromptu"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.mamutherd.impromptu"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
        // Solo celulares de 64 bits (casi todos desde 2017): el APK pesa la mitad.
        ndk { abiFilters += "arm64-v8a" }
    }

    signingConfigs {
        create("release") {
            if (!keystoreProps.isEmpty) {
                storeFile = file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (keystoreProps.isEmpty) null else signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    // Modelos y tablas del espectro: sin comprimir, para leerlos directo.
    androidResources { noCompress += listOf("onnx", "f32", "json") }

    testOptions { unitTests.isReturnDefaultValues = true }
}

kotlin {
    compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
}

// La IA (Transkun) va dentro de la app: se copia desde D:/.cache/models al armarla, sin pasar
// por el repositorio (son 58 MB). PROVISIONAL(P21): hasta decidir dónde se aloja el modelo.
abstract class CopiarModelos : DefaultTask() {
    @get:InputFiles abstract val origen: ConfigurableFileCollection
    @get:OutputDirectory abstract val salida: DirectoryProperty

    @TaskAction
    fun copiar() {
        val destino = salida.get().dir("modelos").asFile
        destino.deleteRecursively()
        destino.mkdirs()
        origen.files.filter { it.exists() }.forEach { it.copyTo(destino.resolve(it.name), overwrite = true) }
    }
}

val carpetaModelos = System.getenv("IMPROMPTU_MODELOS") ?: "D:/.cache/models"
val archivosModelo = listOf("transkun-red.onnx", "transkun-cabezas.onnx", "transkun-ventanas.f32", "transkun-mel.f32", "transkun-espectro.json")
androidComponents {
    onVariants { variante ->
        val nombre = "copiarModelos" + variante.name.replaceFirstChar { it.uppercase() }
        val tarea = tasks.register<CopiarModelos>(nombre) {
            origen.from(archivosModelo.map { file("$carpetaModelos/$it") })
        }
        variante.sources.assets?.addGeneratedSourceDirectory(tarea, CopiarModelos::salida)
    }
}

dependencies {
    val bom = platform("androidx.compose:compose-bom:2026.06.01")
    implementation(bom)
    implementation("androidx.core:core-ktx:1.17.0")
    implementation("androidx.activity:activity-compose:1.12.4")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.10.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("com.microsoft.onnxruntime:onnxruntime-android:1.31.1")
    testImplementation("junit:junit:4.13.2")
    // Pruebas en la PC: org.json real y ONNX Runtime de escritorio en vez del de Android.
    testImplementation("org.json:json:20250517")
    testImplementation("com.microsoft.onnxruntime:onnxruntime:1.31.1")
}

configurations.matching { it.name.startsWith("test") && it.name.endsWith("RuntimeClasspath") }.configureEach {
    exclude(group = "com.microsoft.onnxruntime", module = "onnxruntime-android")
}

tasks.withType<Test>().configureEach {
    maxHeapSize = "2g"
    jvmArgs("-XX:MaxDirectMemorySize=2g")
    testLogging { showStandardStreams = true }
}
