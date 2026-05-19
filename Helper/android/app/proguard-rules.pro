# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# Regras para o react-native-sensors
-keep class my.com.vinit.sensors.** { *; }

# Regras para o Realm
-keep class io.realm.** { *; }
-dontwarn io.realm.**

# Regras genéricas para garantir que chamadas nativas do React Native não sumam
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn com.facebook.react.**