package com.tonyxlh.documentscanner

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.core.content.ContextCompat
import java.io.File
import java.lang.StringBuilder
import java.util.Date

class DocumentManager {
    private val context:Context
    constructor(context:Context){
        this.context = context
    }
    fun listDocuments(): MutableList<Long> {
        var externalFilesDir = context.getExternalFilesDir("")
        var documentTimestamps = mutableListOf<Long>()
        if (externalFilesDir != null) {
            externalFilesDir.listFiles().forEach {
                if (it.name.startsWith("doc-")) {
                    val date:Long = it.name.replace("doc-","").toLong()
                    documentTimestamps.add(date)
                }
            }
        }
        return documentTimestamps
    }
    fun saveDocument(doc:Document){
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+doc.date.toString())
        if (!documentFolder.exists()) {
            documentFolder.mkdir()
        }
        saveFilesList(documentFolder,doc)
    }

    fun saveFilesList(documentFolder:File,doc: Document){
        val files = File(documentFolder,"files")
        if (files.exists()) {
            files.delete()
        }
        files.createNewFile()
        val sb:StringBuilder = StringBuilder()
        doc.images.forEach {
            sb.append(it)
            sb.append("\n")
        }
        files.writeText(sb.toString())
    }

    fun getFilesList(documentFolder:File):List<String>{
        val files = File(documentFolder,"files")
        if (files.exists()) {
            return files.readLines()
        }else {
            return listOf()
        }
    }

    fun getDocument(date:Long):Document{
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        if (documentFolder.exists()) {
            return Document(date, getFilesList(documentFolder))
        }else{
            throw Exception("Not exist")
        }
    }

    fun removeDocument(date:Long){
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        if (documentFolder.exists()) {
            deleteFilesWithin(documentFolder)
            documentFolder.delete()
        }
    }

    private fun deleteFilesWithin(folder:File){
        folder.listFiles().forEach {
            it.delete()
        }
    }

    fun getFirstDocumentImage(date:Long):ImageBitmap{
        return readFileAsImageBitmapByIndex(date,0)
    }

    fun readFileAsImageBitmapByIndex(date: Long, index: Int): ImageBitmap {
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir, "doc-" + date.toString())
        if (documentFolder.exists()) {
            val filesList = getFilesList(documentFolder)
            if (filesList.size>index) {
                val name = filesList.get(index)
                val file = File(documentFolder, name)
                if (file.exists()) {
                    val bytes = file.readBytes()
                    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    return bitmap.asImageBitmap()
                }
            }
        }
        return getEmptyThumbNail()
    }

    private fun getEmptyThumbNail():ImageBitmap{
        val db = ContextCompat.getDrawable(context, R.drawable.thumbnail)
        var bit = Bitmap.createBitmap(
            db!!.intrinsicWidth, db.intrinsicHeight, Bitmap.Config.ARGB_8888)
        // on below line we are
        // creating a variable for canvas.
        val canvas = Canvas(bit)
        // on below line we are setting bounds for our bitmap.
        db.setBounds(0, 0, canvas.width, canvas.height)
        // on below line we are simply
        // calling draw to draw our canvas.
        db.draw(canvas)
        return bit.asImageBitmap()
    }

    fun readFileAsImageBitmapByName(date: Long, name: String): ImageBitmap {
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir, "doc-" + date.toString())
        if (documentFolder.exists()) {
            val file = File(documentFolder,name)
            if (file.exists()) {
                try {
                    val bytes = file.readBytes()
                    val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    return bitmap.asImageBitmap()
                }catch (e:Exception){
                    e.printStackTrace()
                }
            }
        }
        return getEmptyThumbNail()
    }

    fun saveOneImage(date:Long,image:ByteArray):String{
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        if (!documentFolder.exists()) {
            documentFolder.mkdir()
        }
        var imageFile = File(documentFolder, Date().time.toString()+".jpg")
        imageFile.createNewFile()
        imageFile.writeBytes(image)
        return imageFile.name
    }
    fun replaceOneImage(date:Long,filename:String,image:ByteArray){
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        var imageFile = File(documentFolder, filename)
        if (imageFile.exists()) {
            imageFile.delete()
            imageFile.createNewFile()
            imageFile.writeBytes(image)
        }
    }
    fun saveOriginalImage(date:Long,filename:String,image:ByteArray):String{
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        if (!documentFolder.exists()) {
            documentFolder.mkdir()
        }
        var imageFile = File(documentFolder, filename+"-original")
        imageFile.createNewFile()
        imageFile.writeBytes(image)
        return imageFile.name
    }

    fun getOriginalImage(date:Long,filename:String):ImageBitmap{
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        var imageFile = File(documentFolder, filename)
        var originalFile = File(documentFolder, filename+"-original")
        var targetFile:File
        if (originalFile.exists()) {
            targetFile = originalFile
        }else{
            targetFile = imageFile
        }
        try {
            val bytes = targetFile.readBytes()
            val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
            return bitmap.asImageBitmap()
        }catch (e:Exception){
            e.printStackTrace()
        }
        return getEmptyThumbNail()
    }

    fun deleteImage(date:Long,filename:String) {
        var externalFilesDir = context.getExternalFilesDir("")
        var documentFolder = File(externalFilesDir,"doc-"+date.toString())
        if (documentFolder.exists()) {
            var imageFile = File(documentFolder, filename)
            var originalFile = File(documentFolder, filename+"-original")
            if (imageFile.exists()) {
                imageFile.delete()
            }
            if (originalFile.exists()) {
                originalFile.delete()
            }
        }
    }
}