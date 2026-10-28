package com.tonyxlh.documentscanner

import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts

class MediaCaptureActivity : AppCompatActivity() {
    var cam_uri: Uri? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_media_capture)
        var startCamera: ActivityResultLauncher<Intent> =
            registerForActivityResult(
                ActivityResultContracts.StartActivityForResult(),
                ActivityResultCallback<ActivityResult> { result ->
                    Log.d("DM",result.resultCode.toString())
                    if (result.resultCode === RESULT_OK) {
                        // There are no request codes
                        if (cam_uri != null) {
                            val data = Intent().apply { putExtra("uri", cam_uri.toString()) }
                            setResult(RESULT_OK, data)
                        }
                    }
                    finish()
                }
            )
        val values = ContentValues()
        values.put(MediaStore.Images.Media.TITLE, "New Picture")
        values.put(MediaStore.Images.Media.DESCRIPTION, "From Camera")
        cam_uri = applicationContext.contentResolver.insert(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            values
        )
        val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cam_uri)
        startCamera.launch(cameraIntent)
    }
}