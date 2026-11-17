// Todo en D: (regla del proyecto): Java 17, SDK de Android, Gradle y la carpeta .android.
export const androidEnv = {
  ...process.env,
  JAVA_HOME: process.env.IMPROMPTU_JAVA_HOME ?? 'D:/tools/jdk-17.0.21+9',
  ANDROID_HOME: process.env.ANDROID_HOME || 'D:/Android/sdk',
  ANDROID_SDK_ROOT: process.env.ANDROID_HOME || 'D:/Android/sdk',
  ANDROID_USER_HOME: 'D:/Android/.android',
  GRADLE_USER_HOME: process.env.GRADLE_USER_HOME ?? 'D:/.cache/gradle',
  TEMP: 'D:/.cache/gradle/tmp',
  TMP: 'D:/.cache/gradle/tmp',
  // La web compilada busca el modelo de piano dentro de la app (sin internet).
  VITE_PIANO_MODEL_URL: '/modelos/',
};
androidEnv.PATH = `${androidEnv.JAVA_HOME}/bin;${process.env.PATH}`;
