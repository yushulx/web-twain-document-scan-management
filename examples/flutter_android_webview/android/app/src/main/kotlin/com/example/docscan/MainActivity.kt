package com.example.docscan

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.widget.Toast

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
      super.configureFlutterEngine(flutterEngine)
      MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "AndroidNative")
        .setMethodCallHandler { call, result ->
          when (call.method) {
            "showToast" -> {
              val message = call.argument<String>("message")
              showToast(message!!)
              result.success(null)
            }
            else -> {
              result.notImplemented()
            }
          }
        }
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
      }
      
  }
  
