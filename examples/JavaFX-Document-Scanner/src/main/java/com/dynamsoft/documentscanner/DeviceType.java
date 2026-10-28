package com.dynamsoft.documentscanner;

public class DeviceType {
    public static final int TWAIN = 16;
    public static final int WIA = 32;
    public static final int TWAINX64 = 64;
    public static final int ICA = 128;
    public static final int SANE = 256;
    public static final int ESCL = 512;
    public static final int WIFIDIRECT = 1024;
    public static final int WIATWAIN = 2048;
    public  static String getDisplayName(int type) throws Exception {
      if (type == TWAIN) {
          return "TWAIN";
      }else if (type == WIA) {
          return "WIA";
      }else if (type == TWAINX64) {
          return "TWAINX64";
      }else if (type == ICA) {
          return "ICA";
      }else if (type == SANE) {
          return "SANE";
      }else if (type == ESCL) {
          return "ESCL";
      }else if (type == WIFIDIRECT) {
          return "WIFIDIRECT";
      }else if (type == WIATWAIN) {
          return "WIATWAIN";
      }else{
          throw new Exception("Invalid type");
      }
    }
}
