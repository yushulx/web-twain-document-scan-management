/*! 202511171400
* Dynamsoft JavaScript Library
* Product: Dynamic Web TWAIN
* Web Site: https://www.dynamsoft.com
*
* Copyright 2025, Dynamsoft Corporation
* Author: Dynamsoft Support Team
* Version: 19.3
*/

//Dynamsoft.On{actionName} It is a callback function called by Web-TWAIN product. The contents of this function are the default templates of the WebTWAIN. Users can modify the fucntions, but be aware that the function name itself cannot be modified
//Dynamsoft._{functionName} It is a private function used by Dynamsoft.On{actionName}. Users can modify and delete according to their needs.
(function () {
  "use strict";
  var promptDlgWidth = 620;

  if(Dynamsoft.navInfoSync.bMobile) {
    if(screen.width<620) {
      promptDlgWidth = screen.width - 10;
    }
  }

  //----------------------start Install Dialog---------------------------

  var bLNAPermission = false;
  if(navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({"name":"local-network-access"}).then(function(_) {bLNAPermission = true;})['catch'](function(){});
  }
  function isExistLNAPermission() {
    return bLNAPermission;
  }

  //Web TWAIN Service is not detected dialogs
  //Windows
  Dynamsoft.OnWebTwainNotFoundOnWindowsCallback = function (ProductName, InstallerUrl, bHTML5, bIE, bSafari, bSSL, strIEVersion) {
    var _this = Dynamsoft,
      objUrl = {
        'default': InstallerUrl
      };
    _this._show_install_dialog(ProductName, objUrl, bHTML5, Dynamsoft.DWT.EnumDWT_PlatformType.enumWindow, bIE, bSafari, bSSL, strIEVersion, false);
  };

  //Linux
  Dynamsoft.OnWebTwainNotFoundOnLinuxCallback = function (ProductName, strDebUrl, strRpmUrl, bHTML5, bIE, bSafari, bSSL, strIEVersion, iPlatform) {
    var _this = Dynamsoft,
      objUrl = {
        'default': strDebUrl,
        'deb': strDebUrl,
        'rpm': strRpmUrl
      };
    if (!iPlatform) iPlatform = Dynamsoft.DWT.EnumDWT_PlatformType.enumLinux;
    _this._show_install_dialog(ProductName, objUrl, bHTML5, iPlatform, bIE, bSafari, bSSL, strIEVersion, false);
  };

  //MacOS
  Dynamsoft.OnWebTwainNotFoundOnMacCallback = function (ProductName, InstallerUrl, bHTML5, bIE, bSafari, bSSL, strIEVersion) {
    var _this = Dynamsoft,
      objUrl = {
        'default': InstallerUrl
      };
    _this._show_install_dialog(ProductName, objUrl, bHTML5, Dynamsoft.DWT.EnumDWT_PlatformType.enumMac, bIE, bSafari, bSSL, strIEVersion, false);
  };

  //Android
  Dynamsoft.OnWebTwainNotFoundOnAndroidCallback = function (ProductName, InstallerUrl, bSSL, bUpgrade) {
    var ObjString = "Starting from version 19.0, Android platform is no longer supported.";

    Dynamsoft.DWT.ShowMessage(ObjString, {
      width: 480,
      headerStyle: 2
    });
  };

  //Web TWAIN Service is not supported dialogs
  //Mobile Browsers
  Dynamsoft.OnMobileNotSupportCallback = function () {
    var ObjString = [];

    if (Dynamsoft.DWT) {

      ObjString.push('<div class="ds-dwt-ui-dlg-android" style="padding-bottom:30px">');
      ObjString.push('Service Mode does not support your Operating System, please contact the site administrator.');
      ObjString.push('</div>');

      Dynamsoft.DWT.ShowMessage(ObjString.join(''), {
        width: 335,
        headerStyle: 1,
        backgroundStyle: 1
      });
    } else {
      console.log("The Dynamsoft namespace is missing");
    }

  };

  //Error Message - HTTPS is required to allow CORS to function. This error appears when HTTP is detected. (See: https://www.dynamsoft.com/web-twain/docs/faq/http-insecure-websites-in-chromium-browser.html?ver=latest)
  Dynamsoft.OnHTTPCorsError = function (msg) {

    var ObjString = [
      "<div>", msg, "</div>",
      '<div style="margin-top:10px">To fix the issue, please update your website to HTTPS or refer to <br /><a target="_blank" href="https://www.dynamsoft.com/web-twain/docs/faq/http-insecure-websites-in-chromium-browser.html?ver=latest">this article</a> for other workarounds.</div>'
    ].join('');

    Dynamsoft.DWT.ShowMessage(ObjString, {
      width: promptDlgWidth,
      headerStyle: 2
    });
  };

  Dynamsoft._show_install_dialog = function (ProductName, objInstallerUrl, bHTML5, iPlatform, bIE, bSafari, bSSL, strIEVersion, bNeedUpgrade) {
    var _this = Dynamsoft,
      ObjString, title, subTitle, browserActionNeeded,
      EnumPlatform = Dynamsoft.DWT.EnumDWT_PlatformType,
      bUnix = (iPlatform == EnumPlatform.enumLinux || iPlatform == EnumPlatform.enumEmbed ||
        iPlatform == EnumPlatform.enumChromeOS || iPlatform == EnumPlatform.enumHarmonyOS),
      imagesInBase64 = {
        icn_download: 'data:image/png;base64,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',
        icn_install: 'data:image/png;base64,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',
        icn_scan: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAABHNCSVQICAgIfAhkiAAACBBJREFUaEPNW7tuG0cU3VkynQHbVdJF/gJTtLsEsIw06SQB7i0XqW1/gekuqSL3AUx/gaUvMAUknUXRboRUpj8gsNQEBkLu5Jx57ItLzswO9ViAEMXdmbln7p37XpFc4NXr3d9O06THJaRMtsxSt4TIf5vgtzP+jt9G/JtlyWQyeX94UWSJdU7c6/U2kqTzACB3AAGfmEseAPxBksyPsAPTmJnKY9cCGJzcAode4GO5qNaQUn4QQoBoxTnFwSSZnQEAOZtgg8D97i1+xyapsRizgzF3y0RCOkb4vATnzRzt4UcBXgQqzzVxEiCzA+BS4hp6YR+wCSmB48ONEDf1ZnDu2XO7YaHz8vlWgCm6adp5geF7elF5ju/74/H7QRsiXGP6/fuYVz6zwPF9mGVzcDxc1IMB93r3uOuvsfvgggaaZbP9ttx0gbX3yfU07QJ0go1Won8Gjj+ZTI7VkfG9ggAD7NM0FftmwUMp58/a7LIvcU3PUbqE6Oxjw7d5P8skaDh+5TunN+B+/97rQoSz5+PxWAG/qqvf74Pb6e/mSA3H4+MnPrQ4AVOUhOi+07ZTnkPb7oWKkQ8hbZ7h8YJ2H/JsQ7wnUGgPXUdrJeAyWJyZzxDhnRgN2QaUawxNG0T8ACL+PUGfnLzfXDVmJWArxgZsz7V7LuIu6r5mTGdC0NTgq8R7KeDijFCM51vXjbP1zSOnYSpH2nQt1zGNgPXZEG+NFty9LmfWJSE+dC8ANmr/RNvZMG1sRItjN1zE2fs4LvmjUIzwn+ewre08NE5kJVPb6flm3WwuAN7cvDcEwY8x4PDk5DgoAKCrCa35zhds03O+2nbVGsBAJbYNDG+AYa/8bAVwQbA6t1RS0xDi7XgQfQRtueUzVruNyQsQ9xv+/szAIRa0dn27n/SRnJHLKljhVQG8uXmf9paEvmzjF8cA5pp0UaFtR+sAXWxkMsLmP1wAXOPuRptzFAuYm2z0QA7aZVeXSZH2vTuQUHETzhIcEh1a5hyO5S4niwMsh1KmQ84jZXYDkvYHvn4npciJ9Tki5WeauKwAFzIvz2G0VUDe5tK2sHsSdobLPvHiqrPZ7JePHycE3+qC84SYnFye3aFOMoD7e2mavm6jmetUYAGEi8nI13YbMzgAURvVuSQ3/sbXr//+dHp6+rkVWgyyGjvLMpi78VABrv/oM7nOSnSZv1JJusu6mORDmuiDrwXp9arMVIAh68r6g+23fZRVNQlwWVCLdbRTIZHqGQ9dq5vEwRc+B6UohHXHmHCDkfbiFiTiE70pBhX0jiCOrXJXLmIX78tb0A/MdSEyUp4Uz6VzbdDLwOIukgW7wmoyTO5le61iYmxMBWcU3mMjIW98RS0cbDECAKYEXTY3q+YrYywB9vOby6YHATd2u0NuK80esusxgKkYIVVPfX39CmDYXxj55IHvblUBZ0Ot3ZMjwEWuyX/X4wBrd9RfKrWPTzpFHGC5zzCSnCUAcrruu8YAWzY2/BhWAGsFZA2zi8C6N2WjKz1OvsK5Zir1Qq9wwLlDNOEZViaJKtuHyib3UdeUElbBpj5zxD4TCpjrWZxrARwLIHR8FOBCxWtf07W4K0AwGQdVC4q9YDdReFtMsocCLnx8FPdilFY9yC9sdCzUYnyT9QgHvCYtvQjYTkwPTAxjYEPz7y0zc1GAQ414IdJyClf0ThmUS9xDNmCV5OEeEoVJz9d3WOJp+bmWWuPpGFOXLQUTZsoOI3BHPMxqovwLZ+9HXRX4Jug8S/nfOXNQ8PH/xFw/sFgmRKpyUuA6shgSiUVdpvU1pRXARfDgLlNYDpUmqDCNGVfsPAn7B5mKR20zmIxdUSj7FeO/tXMuSoe/zS8kAsFD2Ub5hocco8VX7gBYHmFpDqio5G/0ZiAD2aHPG5hBUVEQuKrqRZyLbRN5RCSEnAQmGFhXLsJDEt8mAdB0Hi/rDIfogsYEQP3HkAmvQmmF0NeY4rFJPAYB0Ly3QyZcBhihI8USee4wkdYhptiFLhiERHHLaAbgLyaoKZJ4Wqx1mIivXokAl0gTcFHNC9lCVj1U90404FKaNq+E5AFDyb56p07qMK7TGTYJfZWcaEzEr4PL1wlwE3eJsVZMs3Fjc6nRJZjXBbB3Mc2YKFUuhftwgGB+1wWyqrR01Q6KZwrHYS9k7OKzGelgYqJS/fOZE54givkCPoKjXKodCtVlB1dudevACq2oUqI+hLmeYRoYVmPD9Vz5fq1VY6Hku/aWB71hKXY3DSqm10EJkaEbQPVrQlr8rlYtD3bqWusA+5/yorLf8pf7lGlfMnY/sKnFklpqf5iafglnlv9yYerVyr0lTee2TJMzcWfLFFREAI2OnuvFacPZt6b04ywXOQFXK/LtOlgviuvloh5rY2AI+8lWSqETcF28+X9oB+tFAK519i506yxb0xswJ6h1sLKnit3p3lp0HcCN2UQXrX2nwq8mZtcOAqwVRNHBaiYZwDl45RKlWLCmzosCWjLQc7Xr7A0GbLQim7QRzdAj01VDfOcrAC9jgTWNh1/MPi6Em3mV8g3O66CNdLUCbInSGrKL3ioVVhrgyci8fnPYluu6naLDd57gwCR4Y8YCTY4YdsZYiijABXD1Go+KX8scYked7hDgZoiR/quzkkZS8qwmclVb+j4r/NW+EZY58QFHr/g1nrr46aJaSo6wLUG9k9D2YkcRPtisDB1B61OMa+HwMlDGt1VZzeJVPIlmbh1c0Hba/pDiVTwJfGFvqoRs6v/IOTkNXX2kbQAAAABJRU5ErkJggg=='
      },
      bNeedCheckLNA = false;

    // npm file mode
    if (bNeedUpgrade)
      title = 'Update your document scanning service'; //'Please follow the steps below to upgrade your local document scanning service.';
    else
      title = 'Download the Dynamic Web TWAIN service';
    subTitle = 'Follow the steps below to enable scanning in your browser';
    ObjString = [
      '<div class="dynamsoft-dwt-dlg-title">',
      title,
      "</div>",
      '<div class="dynamsoft-dwt-dlg-subtitle" style="display: none;">',
      subTitle,
      "</div>",
      '<div class="dynamsoft-dwt-dlg-title-error" style="display:none"></div>'
    ];

    if (_this.DWT) {

      var bFirefox = Dynamsoft.navInfoSync.bFirefox;
      if (bUnix || bFirefox) {
        browserActionNeeded = 'RESTART';
      } else {
        browserActionNeeded = 'REFRESH';
      }
      ObjString.push('<div class="dynamsoft-dwt-installdlg-iconholder"> ');

      var left = '134px';

      ObjString.push('<div class="dynamsoft-dwt-installdlg-splitline" style="left: ' + left + '"></div>');

      ObjString.push('<div class="dynamsoft-dwt-installdlg-splitline" style="left: 328px"></div>');

      var marginRight = '133px';

      ObjString.push('<img style="margin: 0px ' + marginRight + ' 0px 0px" src="' + imagesInBase64.icn_download + '" alt="download" />');
      ObjString.push('<img style="margin: 2px ' + marginRight + ' 2px 0px" src="' + imagesInBase64.icn_install + '" alt="install" />');
      ObjString.push('<img src="' + imagesInBase64.icn_scan + '" alt="scan" />');
      ObjString.push('<div><span class="dynamsoft-dwt-installdlg-text" style="right: 160px">Download</span>');
      ObjString.push('<span class="dynamsoft-dwt-installdlg-text" style="right: 18px">Install</span>');
      ObjString.push('<span class="dynamsoft-dwt-installdlg-text" style="left: 140px">Scan</span>');
      ObjString.push('</div>');
      ObjString.push('</div>');

      if (bHTML5 && bUnix) {
        ObjString.push('<div style="margin:10px 0 0 60px;">');
        ObjString.push('<div id="dwt-install-url-div">');

        var arm64 = Dynamsoft.navInfo.bArm64,
          mips64 = Dynamsoft.navInfo.bMips64,
          chromeOS = Dynamsoft.navInfoSync.bChromeOS,
          harmonyOS = Dynamsoft.navInfoSync.bHarmonyOS;

        if (arm64 || mips64 || chromeOS || harmonyOS) { } else {
          ObjString.push('<div><input id="dwt-install-url-deb" name="dwt-install-url" type="radio" onclick="Dynamsoft._dwt_change_install_url(\'' + objInstallerUrl.deb + '\')" checked="checked" /><label for="dwt-install-url-deb">64 bit .deb (For Ubuntu/Debian)</label></div>');
          ObjString.push('<div><input id="dwt-install-url-rpm" name="dwt-install-url" type="radio" onclick="Dynamsoft._dwt_change_install_url(\'' + objInstallerUrl.rpm + '\')" /><label for="dwt-install-url-rpm">64 bit .rpm (For Fedora)</label></div>');
        }
        ObjString.push('</div></div>');
      }

      ObjString.push('<div class="ds-download-div"><a id="dwt-btn-install" href="');
      ObjString.push(objInstallerUrl['default']);
      ObjString.push('"');
      if (bHTML5) {
        ObjString.push(' html5="1"');
      } else {
        ObjString.push(' html5="0"');
      }

      ObjString.push(' onclick="Dynamsoft._dcp_dwt_onclickDownloadButton()">Download</a></div>');
      if (bHTML5) {
        if (bIE) {
          ObjString.push('<div class="dynamsoft-dwt-dlg-tail" style="text-align:left; padding-left: 80px">');
          ObjString.push('If you still see the dialog after installing the Dynamic Web TWAIN Service, please<br />');
          ObjString.push('1. Add the website to the zone of trusted sites.<br />');
          ObjString.push('IE | Tools | Internet Options | Security | Trusted Sites.<br />');
          ObjString.push('2. Refresh your browser.');
          ObjString.push('</div>');

        } else {
          ObjString.push('<div class="dynamsoft-dwt-dlg-tail ds-dwt-textLeft" style="padding: 0px 70px 20px 70px;background:#FFFFFF">');
          if (bUnix) {
            ObjString.push('<div class="dynamsoft-dwt-dlg-red">');
            ObjString.push('After the installation, please <strong>' + browserActionNeeded + '</strong> your browser. ');
            ObjString.push('</div>');
          }
          ObjString.push('</div>');
          
          if(isExistLNAPermission()) {
            bNeedCheckLNA = true;
          }
        }

      } else {
        ObjString.push('<div class="dynamsoft-dwt-dlg-tail" style="text-align:left; padding-left: 80px">');
        ObjString.push('After the installation, please<br />');
        ObjString.push('1. Restart the browser<br />');
        ObjString.push('2. Allow "DynamicWebTWAIN" add-on to run by right clicking on the Information Bar in the browser.');
        ObjString.push('</div>');
      }
      _this.DWT.ShowMessage(ObjString.join(''), {
        width: promptDlgWidth,
        headerStyle: 1
      });
    } else {
      console.log("The Dynamsoft namespace is missing");
    }

    if (Dynamsoft.DWT && Dynamsoft.DWT.OnWebTwainNotFound) {
      Dynamsoft.DWT.OnWebTwainNotFound();
    }

    if (bNeedCheckLNA) {
      navigator.permissions.query({"name":"local-network-access"}).then(function(objChromeLNAPermission){
          if(objChromeLNAPermission) {
            if(objChromeLNAPermission.state == 'granted') {
            } else {
              var tail = document.querySelector('.dynamsoft-dwt-dlg-tail');
              var tips = document.createElement('div');
              tips.className = 'dynamsoft-dwt-dlg-tail-guide';

              if (bUnix) {
                tips.innerHTML = 'If you\'re still seeing this dialog, please enable local network access for this site(<a href="javascript: void (0)" onclick="Dynamsoft._dwt_onclickLNAGuide()">guide</a>).';
              } else {
                tips.innerHTML = 'If you\'re still seeing this dialog after installing the service, please enable local network access for this site (<a href="javascript: void (0)" onclick="Dynamsoft._dwt_onclickLNAGuide()">guide</a>).';
              }

              tail.appendChild(tips);
            }
          }
      });
    }
          
  };

  Dynamsoft._dwt_onclickLNAGuide = function () {

    if(isExistLNAPermission()) {
      navigator.permissions.query({"name":"local-network-access"}).then(function(objChromeLNAPermission){
        var bReturnToInstallDialog = true;
        if(objChromeLNAPermission) {
          if(objChromeLNAPermission.state == 'denied') {
            bReturnToInstallDialog = false;
          }
        }

        Dynamsoft.OnBrowserLNADenied("Local network access is blocked.", bReturnToInstallDialog);
        Dynamsoft._dwt_onclickLNAGuide_inner();
      });
    }
  }

  Dynamsoft._dwt_onclickLNAGuide_inner = function () {
      var _this = Dynamsoft;
      var _timeSpan = 500;
       _this.DWT.CheckConnectToTheService(function () {       
           Dynamsoft.DWT.ConnectToTheService();
       }, function () {
           if (Dynamsoft.DWT.NeedCheckWebTwainBySocket()) {
               Dynamsoft.DWT.CheckWebTwainBySocket(function () {
                   Dynamsoft.OnHTTPCorsError();
               }, function () {
                   setTimeout(Dynamsoft._dwt_onclickLNAGuide_inner, _timeSpan);
               }, function () {
                   setTimeout(Dynamsoft._dwt_onclickLNAGuide_inner, _timeSpan);
               });
               return;
           }
           setTimeout(Dynamsoft._dwt_onclickLNAGuide_inner, _timeSpan);
       });
   };

  Dynamsoft._dwt_change_install_url = function (url) {
    var install = document.getElementById('dwt-btn-install');
    if (install)
      install.href = url;
  };

  var reconnectTime = 0;
  Dynamsoft._dcp_dwt_onclickDownloadButton = function() {
    var install = document.getElementById('dwt-install-url-div');
    if (install) {
      install.style.display = 'none';
    }

    var divSubTitle = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-subtitle');
    if (divSubTitle) {
      divSubTitle.style('display','');
    }

    var divTitle = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-title');
    if (divTitle) {
      divTitle.html('Install the Dynamic Web TWAIN service');
    }

    var el = document.getElementById('dwt-btn-install');
    if (el) {
      if (el.getAttribute("html5") == "1") {
        var pel = el.parentNode,
        newDiv = document.createElement('div'), newButton = document.createElement('Button');
        newDiv.id = 'dwt-btn-install';
        newDiv.style.textAlign = "center";
        newDiv.style.paddingBottom = '15px';
        newDiv.style.font='600 16px/25px "Open Sans", sans-serif';
        newDiv.innerHTML = 'After installation, click below to verify the service is running.'; //<a href="javascript:void(0)" onclick="Dynamsoft._dcp_dwt_onclickInstallButton()">click here to verify completion.</a>';
        newDiv.setAttribute("html5", "1");
        pel.removeChild(el);
        pel.appendChild(newDiv);
        newButton.textContent = "Verify";
        newButton.onclick = function(){Dynamsoft._dcp_dwt_onclickInstallButton();}
        newButton.className = "dynamsoft-dwt-installdlg-button";
        pel.appendChild(newButton);
      } else {
        var pel = el.parentNode;
        pel.removeChild(el);
      }
    }
    return true;
  };
  Dynamsoft._dcp_dwt_onclickInstallButton = function () {
    var install = document.getElementById('dwt-install-url-div');
    if (install)
      install.style.display = 'none';

    var divTitle = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-title');
    if (divTitle) {
      divTitle.style('display','');
    }
    var divTitleErr = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-title-error');
    if (divTitleErr) {
      divTitleErr.style('display','none');
    }

    var divSubTitle = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-subtitle');
    if (divSubTitle) {
      divSubTitle.style('display','none');
    }

    var btnVerify = Dynamsoft.Lib.one('.dynamsoft-dwt-installdlg-button');
    if (btnVerify) {
      btnVerify.style('display','none');
    }

    var el = document.getElementById('dwt-btn-install');
    if (el) {
      setTimeout(function () {
        if (el.getAttribute("html5") == "1") {
          var pel = el.parentNode;
          el.style.font='22px / 31px "Open Sans", sans-serif';
          el.style.margin = "20px";
          el.innerHTML = 'Connecting to the service...';
          reconnectTime = new Date();
          setTimeout(Dynamsoft._dwt_Reconnect, 10);
        } else {
          var pel = el.parentNode;
          pel.removeChild(el);
        }
      }, 10);
    }
    return true;
  };

  Dynamsoft._dwt_Reconnect = function () {
    var _this = Dynamsoft;
    if (((new Date() - reconnectTime) / 1000) > 10) {
     var el = document.getElementById('dwt-btn-install');
     if (el) {
      el.style.font='600 16px/25px "Open Sans", sans-serif';
      el.style.margin = "0px";
      el.innerHTML = 'Make sure your installation is complete and the service is running.';
     }

     var btnVerify = Dynamsoft.Lib.one('.dynamsoft-dwt-installdlg-button');
      if (btnVerify) {
        btnVerify.html('Try Reconnecting');
        btnVerify.style('display','');
        btnVerify.style('width','200px');
      }

      var divTitle = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-title');
      if (divTitle) {
        divTitle.style('display','none');
      }
      var divTitleErr = Dynamsoft.Lib.one('.dynamsoft-dwt-dlg-title-error');
      if (divTitleErr) {
        divTitleErr.html("Couldn't connect to the service.");
        divTitleErr.style('display','');
      }

      return;
    }
    if (_this.DWT) {

      var _timeSpan = 500;
      if (navigator.userAgent.indexOf("Safari") > -1) {
        _timeSpan = 2000;
      }

      _this.DWT.CheckConnectToTheService(function () {
        Dynamsoft.DWT.CloseDialog();
        Dynamsoft.DWT.ConnectToTheService();
      }, function () {
        if (Dynamsoft.DWT.NeedCheckWebTwainBySocket()) {
          Dynamsoft.DWT.CheckWebTwainBySocket(function () {
            Dynamsoft.OnHTTPCorsError();
          }, function () {
            setTimeout(Dynamsoft._dwt_Reconnect, _timeSpan);
          }, function () {
            setTimeout(Dynamsoft._dwt_Reconnect, _timeSpan);
          });
          return;
        }
        setTimeout(Dynamsoft._dwt_Reconnect, _timeSpan);
      });
    } else {
      console.log("The Dynamsoft namespace is missing");
    }
  };

  Dynamsoft._show_android_install_dialog = function (objInstallerUrl, bUpgrade) {
    var ObjString;

    if (Dynamsoft.DWT.bNpm && Dynamsoft.navInfoSync.bFileSystem) {
      var bHTML5 = true, iPlatform = Dynamsoft.DWT.EnumDWT_PlatformType.enumAndroid;
      if (Dynamsoft.DWT && Dynamsoft.DWT.OnWebTwainNotFound) {
        Dynamsoft.DWT.OnWebTwainNotFound();
      }

      if(Dynamsoft.Lib.isFunction(Dynamsoft._show_online_download_dialog)) {
        return Dynamsoft._show_online_download_dialog(objInstallerUrl, bHTML5, iPlatform);
      }
      return true;
    }

    ObjString = [];

    if (Dynamsoft.DWT) {

      ObjString.push('<div class="ds-dwt-ui-dlg-android">');

      ObjString.push('<div>Please download and ');

      if(bUpgrade) {
        ObjString.push('update');
      } else {
        ObjString.push('install');
      }

        ObjString.push(' the <strong>DYNAMIC WEB TWAIN SERVICE</strong> app via the </div>');

      ObjString.push('<div><a href="');
      ObjString.push(objInstallerUrl['default']);
      ObjString.push('" onclick="Dynamsoft._dwt_ReconnectForAndroid()">direct APK download link</a>.</div>');
      ObjString.push('</div>');

      ObjString.push('<div class="dynamsoft-dwt-dlg-tail" style="text-align:left">');
      ObjString.push('If you have ');
      
      if(bUpgrade) {
        ObjString.push('updated');
      } else {
        ObjString.push('installed');
      }
      
      ObjString.push(' it, please click on the button below to initiate the connection.');

      ObjString.push('<a target="_blank" href="');
      ObjString.push(objInstallerUrl.openService);
      ObjString.push('" onclick="Dynamsoft._dwt_ReconnectForAndroid()" class="dynamsoft-dwt-dlg-button-android"><div>Open Service</div></a>');

      ObjString.push('</div>');

      ObjString.push('</div>');

      Dynamsoft.DWT.ShowMessage(ObjString.join(''), {
        width: 335,
        headerStyle: 1,
        backgroundStyle: 1
      });
    } else {
      console.log("The Dynamsoft namespace is missing");
    }

    if (Dynamsoft.DWT && Dynamsoft.DWT.OnWebTwainNotFound) {
      Dynamsoft.DWT.OnWebTwainNotFound();
    }
  };

  Dynamsoft._dwt_ReconnectForAndroid = function () {
    Dynamsoft.DWT.CheckConnectToTheService(function (bConnected) {
      if (bConnected) {
        Dynamsoft.DWT.CloseDialog();
        Dynamsoft.DWT.ConnectToTheService();
      } else {
        setTimeout(Dynamsoft._dwt_ReconnectForAndroid, 500);
      }

    }, function () {
      setTimeout(Dynamsoft._dwt_ReconnectForAndroid, 500);
    });
  }

  //Dynamsoft.OnWebTwainNotFoundOnAndroidCallback = Dynamsoft.MobileNotSupportCallback;
  //------------------------end Install Dilaog---------------------------


  //----------------------start Upgrade Dialog---------------------------

  Dynamsoft.OnWebTwainNeedUpgradeCallback = function (ProductName, objInstallerUrl, bHTML5, iPlatform, bIE, bSafari, bSSL, strIEVersion) {
    Dynamsoft._show_install_dialog(ProductName, objInstallerUrl, bHTML5, iPlatform, bIE, bSafari, bSSL, strIEVersion, true, true);
  };

  Dynamsoft.OnWebTwainNeedUpgradeOnAndroidCallback = function (ProductName, InstallerUrl, bSSL) {
    Dynamsoft.OnWebTwainNotFoundOnAndroidCallback(ProductName, InstallerUrl, bSSL, true);
  };

  //----------------------end Upgrade Dialog---------------------------

  //----------------------start DLS License -----------------------
  Dynamsoft.OnLTSLicenseError = function (message, code) {

    var addMessage = '',
      ObjString;

    if (code == -2440 || // NetworkError
      code == -2441 || // Timedout
      code == -2443 || // CorsError
      code == -2446 || // LtsJsLoadError
      message.indexOf('Internet connection') > -1 ||
      message.indexOf('Storage') > -1) {

      var purchaseUrl = 'https://www.dynamsoft.com/customer/license/trialLicense?product=dwt&deploymenttype=js';
      addMessage = '<div>You can register for a free 30-day trial <a href="' + purchaseUrl + '" target="_blank" class="dynamsoft-major-color">here</a>. Make sure to select the product Dynamic Web TWAIN.</div>';
    }

    ObjString = [
      message,
      addMessage
    ];

    Dynamsoft.DWT.ShowMessage(ObjString.join(''), {
      width: promptDlgWidth,
      headerStyle: 2
    });
  };

  Dynamsoft.OnLTSConnectionWarning = function () {

    var ObjString = [
      'Warning: You are seeing this dialog because Dynamic Web TWAIN has failed to connect to the License Tracking Server. ',
      'A cached authorization is being used, and you can continue to use the software as usual. ',
      'Please get connected to the network as soon as possible. ',
      Dynamsoft.DWT.isPublicLicense() ? '<a class="dynamsoft-major-color" href="https://www.dynamsoft.com/company/contact/">Contact Dynamsoft</a> ' : 'Contact the site administrator ',
      'for more information.'
    ].join('');

    Dynamsoft.DWT.ShowMessage(ObjString, {
      width: promptDlgWidth,
      caption: 'Warning',
      headerStyle: 2
    });
  };

  Dynamsoft.OnLTSPublicLicenseWarning = function (message) {

    Dynamsoft.DWT.ShowMessage(message, {
      width: promptDlgWidth,
      caption: 'Warning',
      headerStyle: 2
    });
  };

  //--------------------end DLS License-------------------------------

  //----------------------start Product Key -----------------------

  Dynamsoft.OnLicenseExpiredWarning = function (strExpiredDate, remain, trial) {

    var ObjString, strCaption,
      a_online_store = '<a target="_blank" href="https://www.dynamsoft.com/store/dynamic-web-twain/#DynamicWebTWAIN">online store</a>',
      a_new_key_href = 'https://www.dynamsoft.com/customer/license/trialLicense?product=dwt&utm_source=in-product';

    if (remain > 5 || !trial) {

    } else {

      if (remain > 0) { // 1~5

        var strDays;

        if (remain <= 1) {
          strDays = '1 day';
        } else {
          strDays = parseInt(remain) + ' days';
        }

        strCaption = 'Warning';
        ObjString = [
          '<div style="padding:0 0 10px 0">Kindly note your trial key is expiring in ', strDays, '. Two quick steps to extend your trial:</div>',
          '<div style="margin:0 0 0 10px">1. <a target="_blank" href="', a_new_key_href, '">Request a new trial key</a> and follow the instructions to set the new key</div>',
          '<div style="margin:0 0 0 10px">2. Refresh your scan page and try again</div>',
          '<div style="padding:0">If you are ready to purchase a full license, please go to the ', a_online_store, '.</div>'
        ].join('');

      } else {

        // Trial remain<=0 Expired
        ObjString = [
          '<div style="padding:0">Sorry, your Dynamic Web TWAIN product key expired on ', strExpiredDate, '. You can purchase a full license from the ', a_online_store, '.</div>',
          '<div style="padding:0">Alternatively, you may request a new product key from <a target="_blank" href="', a_new_key_href, '">this page</a>.</div>'
        ].join('');

      }
      
      if (ObjString) {
        Dynamsoft.DWT.ShowMessage(ObjString, {
          width: promptDlgWidth,
          caption: strCaption,
          headerStyle: 2
        });
      }
    } 

  };

  Dynamsoft.OnLicenseError = Dynamsoft.OnLicenseError || function (message, errorCode) {

    Dynamsoft.DWT.ShowMessage(Dynamsoft.ProcessLicenseErrorContent(message), {
      width: promptDlgWidth,
      headerStyle: 2
    });

  };
  
  Dynamsoft.OnCorsConfigError = function (msg) {

    var ObjString = [
      msg, " Please contact the Administrator to configure 'Access-Control-Allow-Origin'.",
    ].join('');

    Dynamsoft.DWT.ShowMessage(ObjString, {
      width: promptDlgWidth,
      headerStyle: 2
    });
  };

  Dynamsoft.OnBrowserLNADenied = function(msg, bReturnToInstallDialog)  {

    var pic = "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";
    if(Dynamsoft.navInfoSync.bEdge) {
        pic = "UklGRnR7AABXRUJQVlA4WAoAAAAgAAAALgIAmwEASUNDUEgMAAAAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNGVAAAAABJRUMgc1JHQgAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUhQICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFjcHJ0AAABUAAAADNkZXNjAAABhAAAAGx3dHB0AAAB8AAAABRia3B0AAACBAAAABRyWFlaAAACGAAAABRnWFlaAAACLAAAABRiWFlaAAACQAAAABRkbW5kAAACVAAAAHBkbWRkAAACxAAAAIh2dWVkAAADTAAAAIZ2aWV3AAAD1AAAACRsdW1pAAAD+AAAABRtZWFzAAAEDAAAACR0ZWNoAAAEMAAAAAxyVFJDAAAEPAAACAxnVFJDAAAEPAAACAxiVFJDAAAEPAAACAx0ZXh0AAAAAENvcHlyaWdodCAoYykgMTk5OCBIZXdsZXR0LVBhY2thcmQgQ29tcGFueQAAZGVzYwAAAAAAAAASc1JHQiBJRUM2MTk2Ni0yLjEAAAAAAAAAAAAAABJzUkdCIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z2Rlc2MAAAAAAAAAFklFQyBodHRwOi8vd3d3LmllYy5jaAAAAAAAAAAAAAAAFklFQyBodHRwOi8vd3d3LmllYy5jaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkZXNjAAAAAAAAAC5JRUMgNjE5NjYtMi4xIERlZmF1bHQgUkdCIGNvbG91ciBzcGFjZSAtIHNSR0IAAAAAAAAAAAAAAC5JRUMgNjE5NjYtMi4xIERlZmF1bHQgUkdCIGNvbG91ciBzcGFjZSAtIHNSR0IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZGVzYwAAAAAAAAAsUmVmZXJlbmNlIFZpZXdpbmcgQ29uZGl0aW9uIGluIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAALFJlZmVyZW5jZSBWaWV3aW5nIENvbmRpdGlvbiBpbiBJRUM2MTk2Ni0yLjEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHZpZXcAAAAAABOk/gAUXy4AEM8UAAPtzAAEEwsAA1yeAAAAAVhZWiAAAAAAAEwJVgBQAAAAVx/nbWVhcwAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAo8AAAACc2lnIAAAAABDUlQgY3VydgAAAAAAAAQAAAAABQAKAA8AFAAZAB4AIwAoAC0AMgA3ADsAQABFAEoATwBUAFkAXgBjAGgAbQByAHcAfACBAIYAiwCQAJUAmgCfAKQAqQCuALIAtwC8AMEAxgDLANAA1QDbAOAA5QDrAPAA9gD7AQEBBwENARMBGQEfASUBKwEyATgBPgFFAUwBUgFZAWABZwFuAXUBfAGDAYsBkgGaAaEBqQGxAbkBwQHJAdEB2QHhAekB8gH6AgMCDAIUAh0CJgIvAjgCQQJLAlQCXQJnAnECegKEAo4CmAKiAqwCtgLBAssC1QLgAusC9QMAAwsDFgMhAy0DOANDA08DWgNmA3IDfgOKA5YDogOuA7oDxwPTA+AD7AP5BAYEEwQgBC0EOwRIBFUEYwRxBH4EjASaBKgEtgTEBNME4QTwBP4FDQUcBSsFOgVJBVgFZwV3BYYFlgWmBbUFxQXVBeUF9gYGBhYGJwY3BkgGWQZqBnsGjAadBq8GwAbRBuMG9QcHBxkHKwc9B08HYQd0B4YHmQesB78H0gflB/gICwgfCDIIRghaCG4IggiWCKoIvgjSCOcI+wkQCSUJOglPCWQJeQmPCaQJugnPCeUJ+woRCicKPQpUCmoKgQqYCq4KxQrcCvMLCwsiCzkLUQtpC4ALmAuwC8gL4Qv5DBIMKgxDDFwMdQyODKcMwAzZDPMNDQ0mDUANWg10DY4NqQ3DDd4N+A4TDi4OSQ5kDn8Omw62DtIO7g8JDyUPQQ9eD3oPlg+zD88P7BAJECYQQxBhEH4QmxC5ENcQ9RETETERTxFtEYwRqhHJEegSBxImEkUSZBKEEqMSwxLjEwMTIxNDE2MTgxOkE8UT5RQGFCcUSRRqFIsUrRTOFPAVEhU0FVYVeBWbFb0V4BYDFiYWSRZsFo8WshbWFvoXHRdBF2UXiReuF9IX9xgbGEAYZRiKGK8Y1Rj6GSAZRRlrGZEZtxndGgQaKhpRGncanhrFGuwbFBs7G2MbihuyG9ocAhwqHFIcexyjHMwc9R0eHUcdcB2ZHcMd7B4WHkAeah6UHr4e6R8THz4faR+UH78f6iAVIEEgbCCYIMQg8CEcIUghdSGhIc4h+yInIlUigiKvIt0jCiM4I2YjlCPCI/AkHyRNJHwkqyTaJQklOCVoJZclxyX3JicmVyaHJrcm6CcYJ0kneierJ9woDSg/KHEooijUKQYpOClrKZ0p0CoCKjUqaCqbKs8rAis2K2krnSvRLAUsOSxuLKIs1y0MLUEtdi2rLeEuFi5MLoIuty7uLyQvWi+RL8cv/jA1MGwwpDDbMRIxSjGCMbox8jIqMmMymzLUMw0zRjN/M7gz8TQrNGU0njTYNRM1TTWHNcI1/TY3NnI2rjbpNyQ3YDecN9c4FDhQOIw4yDkFOUI5fzm8Ofk6Njp0OrI67zstO2s7qjvoPCc8ZTykPOM9Ij1hPaE94D4gPmA+oD7gPyE/YT+iP+JAI0BkQKZA50EpQWpBrEHuQjBCckK1QvdDOkN9Q8BEA0RHRIpEzkUSRVVFmkXeRiJGZ0arRvBHNUd7R8BIBUhLSJFI10kdSWNJqUnwSjdKfUrESwxLU0uaS+JMKkxyTLpNAk1KTZNN3E4lTm5Ot08AT0lPk0/dUCdQcVC7UQZRUFGbUeZSMVJ8UsdTE1NfU6pT9lRCVI9U21UoVXVVwlYPVlxWqVb3V0RXklfgWC9YfVjLWRpZaVm4WgdaVlqmWvVbRVuVW+VcNVyGXNZdJ114XcleGl5sXr1fD19hX7NgBWBXYKpg/GFPYaJh9WJJYpxi8GNDY5dj62RAZJRk6WU9ZZJl52Y9ZpJm6Gc9Z5Nn6Wg/aJZo7GlDaZpp8WpIap9q92tPa6dr/2xXbK9tCG1gbbluEm5rbsRvHm94b9FwK3CGcOBxOnGVcfByS3KmcwFzXXO4dBR0cHTMdSh1hXXhdj52m3b4d1Z3s3gReG54zHkqeYl553pGeqV7BHtje8J8IXyBfOF9QX2hfgF+Yn7CfyN/hH/lgEeAqIEKgWuBzYIwgpKC9INXg7qEHYSAhOOFR4Wrhg6GcobXhzuHn4gEiGmIzokziZmJ/opkisqLMIuWi/yMY4zKjTGNmI3/jmaOzo82j56QBpBukNaRP5GokhGSepLjk02TtpQglIqU9JVflcmWNJaflwqXdZfgmEyYuJkkmZCZ/JpomtWbQpuvnByciZz3nWSd0p5Anq6fHZ+Ln/qgaaDYoUehtqImopajBqN2o+akVqTHpTilqaYapoum/adup+CoUqjEqTepqaocqo+rAqt1q+msXKzQrUStuK4trqGvFq+LsACwdbDqsWCx1rJLssKzOLOutCW0nLUTtYq2AbZ5tvC3aLfguFm40blKucK6O7q1uy67p7whvJu9Fb2Pvgq+hL7/v3q/9cBwwOzBZ8Hjwl/C28NYw9TEUcTOxUvFyMZGxsPHQce/yD3IvMk6ybnKOMq3yzbLtsw1zLXNNc21zjbOts83z7jQOdC60TzRvtI/0sHTRNPG1EnUy9VO1dHWVdbY11zX4Nhk2OjZbNnx2nba+9uA3AXcit0Q3ZbeHN6i3ynfr+A24L3hROHM4lPi2+Nj4+vkc+T85YTmDeaW5x/nqegy6LzpRunQ6lvq5etw6/vshu0R7ZzuKO6070DvzPBY8OXxcvH/8ozzGfOn9DT0wvVQ9d72bfb794r4Gfio+Tj5x/pX+uf7d/wH/Jj9Kf26/kv+3P9t//9WUDggBm8AADAAAZ0BKi8CnAEAAAAlnbvwqGaRP1v91An2sfGnP5R+CfhtSL57+Ev65/6L5pKV/MPtl+vX+P+Q/9y5Weg/K48T/F/5b+IX9d/5Xxz/wH4ufKD87f5n3Af4t/H/5j/Sf75/Ov7H/xu9d/Uf93/jPYD/Hv5F/UP719+f2w/3r+V+w39Vf69/RvgA/kf8p+e/7mf737Bn9o/wHsAfyf+qfP/9o/9t/x/+R+/n8Ev5P/Xv85/ev24/fn8A/4//MP1l/af99v9l+AHoAfX/9En8A/p33//SP6N/Z/5f+EH7C+NP8w/tH6cf2n+/f2f2z/F/jv5X+un88/qX+G/xH4efdf9x4JuvvMj+HfS/5j/W/8N/Qf69/lf8h+HP7r+qfhv+wH+n+I/i9+o/kT/Ov15+wX8M/hn8r/sH9r/oH9W/yP+I92P+J8TXaf8l/ff69+wHwC+l/xP+Y/279S/7X/nv8h9tXt39J/C/3X+sn9n/GH6AP4j/Ff5n/a/1D/tX+n+vP8b/p/HK/Af47/d/5n9jPoB/iP8a/oP97/yv9i/uH+r/0f5K/u/97/wH+g/vP92/63+t+O/51/YP7//gv83/nv8P/0PwC/h38T/nX9g/w/9c/s//E/zH3U+wT9aPYR/ST+s/XZ/rUDkdrngDvQn9gn7D8eI4qPuqySA+99d5Ip6blw0OnNeSOYpmvkbfCNxAAqsj2Cr89SnlC44rlQUN1wavUfsouXnjpCcwfEY/d/Kzld5TJZaByhV26SnkusqH65n9f/2oHbRhmtr3n7FemFa/bHetWiRElTCQoecTbaGUpvBmChdZuRxprGrQby6PF6TEBXMA79LnpfTqOzprO7lzw5tMCQwwkN9E0olTEgDePO+j9EM5Xzow1pf1fXeK6mpMryStdz2kd8EKijs6Bj3VeSdt8MANp6k8BSzkMMW/fUlYLp7qM8/9ZumUZ4YDZKYR8Ajrb5U8CG2zkG8lT45CH7zIRlKSkUdYmN+jy4e2y5igFrqhFSeBWRNq4wksPYgarOJEWrLFCm/TEXxUI4icdxYspNDamODU6SlvsF9NgcCm7ixSP1Cqq2Dog/J310j5GECXY236nLXN4ZEMKhFDxbELnW18yn309B3tzmUkfGXkwRVfS+b8ddlY2ZXyVrfAplX/oLRbsplvOSiiAz3ap2E70lsgKb5dUOFaaioghk/MMZB+I1CyDn1VJnbJ8IJn9FCBjJ87GKc0Dbxi+XgbsOZ2/573JJXnwmCcypPNCxpFv7BB7/QN2ND2VaXXZBGS7mCmtvLFx6E6qwyycKTQVy0zI2UBg4wnTFnVeFk4/C6qb1ZtSQVtoIdSX7vA6tRADUGdby0KkG0Y+ZOzCi4cYD2qJOKgHh2riBUNI5y0Brs+JIHn7hqBEyGITbvTlvcYzjG/UYVM8OU8K7+WGc2gv2w8mkfVpQk4mvvScRCW1GtNKGDDpbaOaBtk4+ZPGmxFoKTnZxWf8F04vIPIFLFEwL8VeM4q6fGmlR+4tF5L1F9LWirEoEb0ubQQ91X13mjoim0cyROQFMQAHcxFar9EgIyMSllfnjnFAwuyMmqSp2RuivjQwNpWlQtTgDRYLljdyuW4Xha5AXT8t3sRfnDy15Z8swYL2fHQWgRxIRaCmU5IGy+elg/ws7VayPJIYwRRu0bPdV9c+bXHorBVGSd3m6XdDdAEk0h4SiRfgDVKJklgeqQQAAAS4eWvT5lxZDiimvshDX3ZEshJzfBgK88ghBbFL/JXQqQg+mpLw3LXwlJKuIggZCBjiCxlwdVhptExpzDOUyAw5uo1NNW25X7pFaLQAWWvT5QrW6gSJSX49HRE2WBuiTHHB2N7I7IGFn33JbD+jb/3LU6IOHH0cBtGPrQINDZrLjlwznQ5aoo65wvaSVpEB9P1WkHIiK8CkLscpiqA/0S11dPiwwqxpCwnPrOqR1J8yVjqR1619ts1kFSVkbDBy31mvVaDOu/cUpP/0iTLHcMQ4BwPLjC0o3Lygtf+EDSNlqxk/CE7aCGY+zR+FiUVfNmbgVUWy4Nwv0nx0GZZjcOOG1edgFBk4cKwntxLGEwdJQ3afK45iQeTm/ydfm87AwjUK2I0AlPUw3TaJOPMz0IVMo+8qeflFzH7JpmTcpJfY78l/TZdIkAcXw48Nqsb+s2UtQrJbKCSg2P541NRRSN+vqVbxVCuQHtycfWzPTi1cZaG6WOuuyOGO3qMgeKFGzU/dguK6ZDXQ8dU0MeVhPGm0S7sSnEGyFs/mUZF/7PR3O5crqvrvNHRFNxU2AURrncTH7x45IVvWo8PWTB9X9oN23sPasdKMnm4iQZt4C7aV8Kz3IRg48tSZhZRozbCbhL5alijeuP2VN1H1bUUfkrR6LCjwUDFYWcc1qkTni5AOHU9wH4HbI8MF0tm3abokIQ5FLrEXDc9/60UfJDosG6L4flGpuICnA4r7/6MPIj5BBaGPtGPmT0+6my2AUop4N2nMci/OofFinowev8N38E0BnBmEfp5+RZJELOQ+2vT5k7OnqwNLBBCkDUVzV7gHFTIDpO674b3181SIvmNzdAOEU3FTbtGz3VfXeSKcWY/fW9dDWWfo/XpAfWRW66jCooWvF6Ut71usTZeUv7mWXZ2shauKm3aNnuq+u8w/GM1LrxSnlZABakFFc0i3oUQE/Dlhd3WnkokYMFOdVpC0+ANvrfzwxVRGKuWript2jW4eAV589MQkIvnWJmPKcuQj5ykAAD+/11C7+1HfrEyoMJPU6XnItaOheAkZKvKUEEv6UEc3R+M51QWxzFOABHIF4Be0R4YjEHXQpqHDloasp0beld5jcONh1GOExV6vQqNPRfb2p3RLYUdOQtho33T0iw4ngPUK4wIDhRf5pJeMIJxFuQOmmbyfq7Xg4SVuCjGaQQsgEvhCZnHGMFzuHp6oP6PvlYRsRRaaLqyO9PVCAJ0D+6Oqe6n9dkZn+OdaqupaI+UZxCZr0DNHEbus8bksXYnomCCINpbqkb3SkASAucuOKKCSw7MCDEBCvaBuxnhJVr6Wt4ehiGjefDXcFtfZ2/TqhlLqqDNozLxaARAOqTBTy9aYxT1q0KQlzXFumvR86rP4+bp0CuZf6m5eyqe+ibvqEXupZ1X6+y1mKMDHAuHGR/delVyu2G2ovHHQ2vfyGecOjU3AbHyG9CViA/26CrgUwp+gn/O327U1m1lLQ95uMs4148useMAlcyf1xNw4jd1mhc00TWX5OLsVcVULZ3Ytv6qE2XzyTEd5AIrtdrsVkDhFg8bld20w4uQT/EI61hXiMdP8kZHV/klWqJzf1G7rku9OAsS6vggPFrFBBH2tlvkRtiD9Yj5i02ikmDlWmWa0MDau1gxDSs+9sdH3BojMpcvSspCwkyDQzrvz6GemH0s3MxYHsKYQFz3akVh73kzEH3GvcnDPuvKNQ5w5MCYht34/bntUgg8e4Yr4NDRshHlRkCKIZhJSB/Sagl/tGln8nVyexUhDgA8ge84jzNIC/hz8iEfE7kz13PRFXkWFR3L5nZIuHgse/QtrA/Foyuh4rsc5iRJk3vqIH83yT7Yrag4o91RRzo4GUeJppXjsqtmmRLK7pzaVrVT5RzgJ9LRrbaLNED7EOB+OS8JE1GSwf+4ev+qq+CzcW0b9Iu5iMRSFf5PrkuviKiOLH59GR3gMlcxM1kSFhd0RZ8CGoUp0UpU+QAXeJ99ffDBCzr4lXok+H15NiYt2k6GgnGbKNkYDvJcL3n/944RjoscKovamTqySwyvZaVNYOrdXic/2g7n/tSkZKIf8Y43QO4S2WQGYmpGm85DS2rZqBPP5LjSm7LzyPZxJHbgPYqCVHX3z/AsOGhb76xWmWqO9lkVqvdSpCeVc0rDZhR/sy4knnsqFKKTv8BrKwlULwx271JkjgMeaTJY53N/r9KAKO60Z7GbvRa8SZsJSb6t4IgK5l9VbZMLv/92e2VqtqaIwaUfV8oXstZ3UJfvL8Ks9z4lU126/qAYn+GVi1vFW9EFXyamRUuwjCyGT/z46+BGXh6izllRA377UQZpFJhDCNYnyz/h0MLuAHtyP08TG7DiXH0+atX2eRdhGo2sC2+5SXlFHql3hKKsc8+yuJtFeoPO7G30v0YrHaMDofcIazUDtUTtz5lpg5wRRJrSxayzLP00m+RdSm2rs68jgNbVbxNaIoIFatWQRo+C0d21bsUS9xCGrhDj/f6eLW0omDQZeaMv87USzmnvnb0CSVVQ2vfPwP+FdownpT6r4MfrX8yBNlGzUGy7vjd6+PBRpA/eWeEid11LJWCNqXeZX5VFI1TqL+oDoXuwa+bXrZSbuwwcRj3JEdYDnNJwtoj8Zt8ubC0aLk9p9MkroGnj4rzgteCBbrK7UD3UnGenYlcRQ1wG3gL/YtrPaf0YVCsnie8e6Gb//yYztgMSZwHbJRRXtwDsB8743GqbDTFPi/3KKbxgQwAIsBZtA0KHMbyk20M8Hu1bkWUlOEEcjMhlm1k3k5p2PlOrlyliKhNXq1RK50yz63x9DClT66bxYKU72/Zgnyaz1jqYvgByjCC0vrwf6R6w47GX8oJJdlULOvv1tA72QqLDgtNG9lyQ7FK/TEb3bTvWKZSHUb+TrabcSfgxzCW510LhKnnsh0anNp13tIDWvUBrLLcQDM50QrQj1uxCCZ/G21v3iW6tkXleL4af5P8qcwEj8G7AJ0BfFCGfFp+MKBB+tFCFGMOw3qORwKfvy3OSsCC+jHQgW9UrDZaXpwZi8b2Um9m4tURraH4S8EipTNpNNdhc5bIC3wFxN16HgsN7Gd2va1hnGJlhk6N2LN/gS8xffErnrwHbD/PA4K3aV8TRMXbJKOX4HxjpTADjG0VmI2Ab/1wAJ4OJzkJItOqPYcX2pCsISFA+eBknU6PjupViOkGzDrIMesKc9nYPChKSOLWXIkUvkXKcFcD74KGQ7MTqfY5S3oEHYJvLECdhCUw49dXmB5gtBNUo04I4B4CvAJ3Axwqnjh57WsY+ITjV0F0wxWZIbvE+CMUxvqr9KWIlYfQaGnVc91xoFD2EwFOplGX549grVxuMiRJFHaitH6sAEIHWUWfZpSdbtcQEFmGJpO2GCfbTvF9LMXxRSOK85THOoFckADIf0hK11UeYLMprVvST5YWwXCkXkHaLPIl08B2jw7+Ew/4YSm58RFkzXzajj4gDnN0CDqPuqzrYuGqpfrdjPPgeGniydjV3acDtm131j/awJuTw3G6Lbzn1U6qy4pVrk1RRfdBFwEQX9DPsIrZ8DaTgBy3tYwpUNjmoh1nJhlIbCMBReomE6AUC9cJrO3K9A/KEQi88EZsxwiV/sd5WmaohPqMOk0Ufbf2h+mvULCYOhXZrRl9tyYLKP7dQQyMBAABukqfHhY4mlX0vUka2CNCOZang6qov8VzlmzCieR4mygDnNlAUv5oXz+JmZS4JY8yJvRDmaTNRKNuR0Hl6pGX6cO109C/NwPeHIbPq/WfzDcyjY4j4ZUtJuhsc76wne8SxcUHESMovPMgWqZRbdF33VRdYrr0uf51MNcV4Vq4MzUkK18mVsxRA0elszK1xNyC16TsEI3JQZgSHdqsg30oBGOdHa9X6m112XqFu6gNCRfjxibgxmJW7msAKE+0iZn5FE0U/52/RDJL8qlN8FPXdb7vxropGyhqwD3gToy5zEUTeNPkCdEXEwXsR6bkc+mx1QaX9SCAo210QuxKa8PspO54Ma76VVyvlmD+/vHZNYr+TU9zIzT4dWgxY6ASKee7ZPRbZHcva2hpvKGE1w3wvB01o0CoqC0cDVlt21wND6mMtvM1stcfcjbR843qKlzZO4aPzsQCtROBjICNHfI+FIGLcRMrW7kXgRU9CVJwou08oxSceYHwt/rL9MIiB5brFpQ8FueNxKMEy3oMeg2PVqbpT5p0BcM0wMKNSNN8dXpdtXPvjxUYJPiKo1y6WwOqG41wbPE9wJcuabInY0/QUnMBcDyJJdWEQmGEnQJBycQN5yQnXGscuVcecV7XoCn5xT97Ex1hqTvRiKehCnkbCmRNZIdoOaAjR1ya0tM+vMbvCqAJSSmN59wsktlCwMrqIonpDyHsmlTaDQyevwIzycg+JkRhPRjRSsFcT+sQg7bYpGKdpr5Yreo69sILpt5CuJ2BWPZTfKSfgAnkNtEydzKZvMZFuxpfMtNDDjRc2aAOmxwSZEVkSLcSjtgAsz2BM10l88rpe5etCa/q8GhtFNwrZh6fmAFQWdfNWZ2Ix5R+7/9diQh6TOTyDVuN3q3bi/3bIw9GNOCqcAqGaT855d1B5m5qJNJhdDJxZMCdulKsjeCXBBZyTJP3WAdociHKVtmokwdWrjymd4OBT6kdgMyxhRM4Zg30miXapKwhJMugfjSfEosAVqrJzgx0LRnx+2pFeVpBnQ4mjcObBStEcpQTWotzdFdeX/nuoIeJ/rUldKsJWD8xwv0NfBYmUIL3mGvT77FquCVBpiNxbeWBzXifP/3KLoG9aQtvMS8oL1VBt1zEpb+H2UZJ9S/yIKv3I/Ai+HjVnaI53Ak5NHhrq0C1KoPmq6XcG/STHXvI1GvABBY249HmW+W8F9E+CqHtW10IDIPO2ZQXzgNjgIh6/cschVfAe+Nd0tywIJCY7NAYooOInv4wBHGC20otcEtmncAT8TsLn/cEvoDdm4yeQbmwtzZ2UJKh8erppkzijvkmdWTUpb8AgGD7CEh/PrPGtnNg/1o6BzTUdvV9tMBi44KJZXOHtbfYkn4RB25svVQoXKDbJzX3kKNX2JvrlyKPm8CXe2jEGQzlPOICrtHQS1h1EkxzTaLrF4LaaQ6UXS6xv/My0wy5MZCh1jnOMjd8ojsb/ZuTD/T+bA+FiXCa8xrGAHOPu3SeolxowlfsHKbRIAyMafXSFixwYC/X3wZ+aL01jpLaEsrSfr6IInwsXumPSOQo+SLKKwhT0uGq5kCRNg1Y2ZM7YV1pIuqc/rQXaJuGvzdh8k6V8J3UQ6Jsx7HhHBWSzgKUtffSW7pGJ0A0RotGvEAiFRsAWUx09r8FzfUtNmZLiwOveab4l6+GKJiDtdl8OsLHjpaFVTm2WP0UxPvc47r0ftfvMZQ6HXofgGH/YWotSBgxdEQy27v9oYcq6W0ni4JGJVg30ZoDIk1ESt8BKiRrHjeejNBiap6EiOKwHRyG4jMzKipgXJgeA4D4XkTdXfPLjXQ5r9XxKAlDX4bk2ugPolige24XgU6Evo7rNo25HMR1RZMhJuNwJQ4638C+oZXoagNeac0aduZdffZUJbFHk0tQIlRmvLz4cU8d3Q5iAzyNyb8cTu4HJ7Y3KRYLpL4dVMAsMmoVIwsrPBsy3sdTEjhLkU4kqEQnHNPePbEMOW+nczdCxuec34PAVc5n7AsBEnjIQj9sg3fNqw2uvOUENxc5vuc5AIR1bkn3MLdMErj9tSZKBWgtuTyiUB6SvFjz3NVgWkeP9/7kuNJ2vZXy1lmTMXHCwjcpQbF1nnhwY+YwgUR9NayACBWZB8PsPdpMHAVxXEA1xwEub6l2H8ZX47ahIsLzwmsQ9vYAvjJtIu7eUAYmU34u08ydgVN5BSpQ9/m420Yi3cI+t5A7r3IJHM5Vz05cI6Wnk/nYbznHhhy2D4vTyE6yThHaIT8FKKFPNbg/STW8FRgLzjbSczqz1TqnJNUETK+rkzzu/TiyV4ec+ym6U5obohPQn1VC/1COr2QZOM9ihUTWS+tsb2VFu/PhK/4pFhRMf/caSQxkeVwwvUZ9LsQGXBCq8ekrUiHsYq0hM31EUUwO7RXSaDZKiAsSvlZM9UlVA5AobGDk+XLMiMLxW8KE4w/6dGkcG7Fo93og2lSSK2NAo3A//I2vrwO/qz4eKVH8CQ7NB2ppthmKU8oOjLaZG3ajjAzPFEk30fYDDVpT4zA16h4aWnQMpvk378KqQ8cAG7fy30T9nC8uAs0L3aa1IwqDshyXuIABdbWx9yY2VXqs+XyX84kqNjTNcB3Pn/1+GdigFqdoRYawkNe0zSWh8PoJmw9AgvzyiPLK097S8N0X4NlhXgzp+55+OtYpD9uW7Taur+xBGuo2zl1x24ZFhrouasbZiTCJlcRGaWZ10lE4H4f4sLJ5nqGtAszEe6zdU/0IiBCreB7jbMpu2YuHEPAbZmWiDA/2aZiZBabvTdcBMgUhlmltFZmG6fFSUHhPlcaN445y6V69NJvCdjY0jsXw8HzE3ocC75cOidcm1KCRKm7Ai0TivDfBaT07em88z3G2K9fS7L13XsdkMfeh/vVPgbslEPBDRdUMH6PXt65KX2Oyw+pRlNJUsFN5RK1O9qiDw/Y0nzvJM9Qg7QH6jow3lKKc9K2+4Cb52xPYRneht2MNh8DLIdPGxr68tCQ61orbET8CFFWBvMxPMtZw6ssZnCy8zJqjX6JvaQodqy48HvzJXAM3WCLBVHLypNsRFbanrue3D+K4ILTKivxv5j1GymIuaAmSyO7xo1g3JhaDWZ/++4zg+VKi/Q3ebayz87PHq0iG2frUccJfKhfIvoeRmfqNvcgCLd/Qy0j5bTkp/x7Rz8cZs7iyfWz9XUgDTtxm1LYGMtFlit3Qwi1n3VSOie7UM0h4IGxFfB41LcJv+XFlH4W/MAuvKkG7LWHgx9meLWO5Oe+wj/lh7skUSnnUR25naxA1lyusov57TMNfyoOJfbokv+1hI0HQdj9dwROsNpKpEil6oKdEwAoGpGIByZDlR6/hOREvoDQGegYzhVcJm1mYvsKPr9NBzWE2WPGz9hV7TOPbhf84qR5hDp4G7YSXOWASDa831dYFP1iYFjrYASlnUMXX2vldlFcUyOeqEm7MecAjWA4a6iOKRFapRBYPrfz1bxeYNm2EeoLQeuHtGjWUG2bj2FBSUCMnH0XQgGA7XLjo9cGmTVoj9lYwgA1pkXk0DON+kV+IIZWJyZuKXz8NcmxcnGGoCu8s9tJ6U8ivZ/eNUK/9LBZVNId8KIdzYtimg0se81QQXRBscYywEwniJIpWnIX3IBOpR9RKSMZE5QxmkSvwekQXHKeV21JdQZTRpoaHcmuw2MYldPNfHoyG0pTd3MEv5DwnM2w9/BJuz2M4ALEqbkTIJOnJP3lcg9yRveExKIbWS61u9i/G2Lap6IeBhJxJxvBGw5P6YN933g0y/LUPpSVn5OmKGbu1t1DNLxMVRXIW79blD4R0p96df9bsuiehnQu34gbY406S7/SQks9rxRy2DOHHUUoSvA1FSQZO6AFJ+/reYS1B2wBBQ1Hxa2B50MlmbXcYXWfYePddWaQhDS2umZcigmTulhuBgqPKotowBSr+PKhwOvHFC5YOPhdVGHj8We5f9uu8f/yzSy01DS/kfTWG1A112yyy5G2eyhrZunJmJI28tJxU3j/4zWftcNm1YEAFRQbxYyrWqSnMYHqJZje7X3WvsGHZ6b6RcTTZcF9jgPZyrbNr5kj9YlEjHUTQI4AHgsyUm81IyXbzGK8PM96mDMOsjZ5oG4nuoxTe0izSMvEGo7McZdgqpl8b9xQ/GUg3KzaRfYdwS+q9ZgFiAjAZnk8YFwuOjCzOsYG0aMUEyp+jSs1nYC9ToasssBhbOeHR/jn6rJ6HXheqs/7OFoG/Hh1XHVsW/jWRd+GpXsCPIViBi52QivvkqQP70xLQy5nZOXqaOLaGT/iLmn8mXER4jTcud9TSzzYGYG7ffihfX+YXENgyjKkh8GsKvVkf3PTsQemQmMDXi/gCODAxOMmkL9nNdVZhShFiI6Odfyb3w+CH15a9TvCuYEZ1uBajNHTK5YYKsXCKQR8+2tgCzi77GUkuyxFZO5EULNeLH8vpbTndJas7LQEr2HfuRykgDkm/9EZYRiZBcu0ldbdgeVjTNj69xZBoor7mPCyNal8mzVUPEtQlJpJy5Y8YPapNGyTgrJy9GHXsY5WzhePFamAd7BZOpOTePeJs3/H/AGYXJzD3VYRtYlzChOFQXq1TCJQI/zkmW8ZM8VnUvGF/N+54L9QGHYfGuIKo+2/38CqzJZAWTbc8BFzXt+BVHI6SXQFThVvje4Ox6pggKCjSLVtgkZv78W/5RSgxf3PIWBOmhnvK1IfO99Q8WN/YsWdK0FNR7iwLsZL0gZz2Y4qUGX2SraOjpIUA+4WW8iXc4F9HfASbFrS494aP1JO0A87B5EFQrdKBUq8BiXqWlQ/cUuoejYECovawOh8aA4aExI45A5BBdrYhcI1tNE9pKsdb3Y34s0hLh7E2bh4bpe8DN2T1SN4ROIaiRWlTQpGU1GF5lgHlc3nTGc5jMsSQAhrDF+flgg/jhDZ8kkJJIu1YNv0s7AAGkQ7bz46jPN+0rJJ+s+43PY91nFI1KhpoJDgXNaCNqoB3mRwOWg2+T7z7gzwHphBIqAhRXF0bD0ernouiTaWneGClarfrKkdIIQ7GG8ABcHCT1i4qaACLTVJWUvWYI6DbKszovxCefwwQS5TiCIQHBbHXKbDmrhzXCLZ5DgMhUKk3sttlfwqoT4godMB3popZSItk9eOPfnwyCdikvBCbR4ZlbrfmQGRDTAuFVycBNZGAJDtCYkeYzJreaI9MQhJDXsy0TAjqdt3MDk1fFrGtyUZXHi8tqPEgEGNoXezsPfEPNeYsAAwQ2/w+VKwVs+kxxXIJMnyC4mbVILlZWOEMv+yJgg3P4rND6mg640nKy+oyf26uCmIBGGfFpCipFyHjdYbNJQ7J+5uEMaOGdq9YffvQIpwVRhpiyjToPQBC5uNzz0X1XQ0yyl614f8zRH7VozWThZXG2/cB4qP+DbP7TtDHxaGtYcIzB+26xmcU2CGwqBv9VsPHZe3NJhUAR9+xwKTo4P3EBr3D50C0HK7x4hIRXpNuPIhdHuJqZVi5aKYHBu1IQlxC4w5IzJ+PSKFjNj6iTwwXFzChVtL252IDS7IEWJPcoYj1V9CG1+puiBXx2zgcYptIoiZr/XSbTzrnszTpIw6DJfuWA2TEAsBfk0cPRiigurZ3NbnX6VAJezVsHtxikoZRvpyvJCiPmd7rZcji+t6yemaCU0z4sF6n+WINySvSLWrnxgbLHP14RmJUCjDcdgG86VPzzBb/WmbYhw7PE5/RR1H86OoqBK/FBMENwSNlH653AnkeHYjyRVfzpT6PbGhchY1vibEejJCC5q/wlkm+KX/gg3lDRsBBEvhUdXNbjchW8j/JPUIwQfXl5OwZaj/rhd5WHMb4QYMeppalA0w9o/I+a4tXPEkVqs5I5/KEyn1hZv70W9CB1Efjvq8om1yBMTbGU6i4mpyg11WgmrQ9T7iJFyCD4hJdEiFq8e/jrmr0EeJlHJm0BRPVN9TdKpmA+pBjO8ILuhGZ4/zLE0GVEm6cY8qiEFdRId6qwG5hvUN1E8YGi2+suOGr1uKsgaKVZT4QHsE1dSkER3r6oH8Mb9A9Cm0Zs9upSr5KTa/rzGY7W5mtohPJvwd2bC20rlRI74oFpUe0BnivaSUNpzPbQkBT8YIq0PwS7CbJdAIK2ISsHVlmgCP5L7Mwgnja+oh1XzbKS8Ahphmj6HIgDYdvcskoPC/ywCYBtWmvEORlfbOFWIlvy3RY/QXvzTuRo/SRjVnJZdYoS010OXb+yRTwWXuqrFsRfdGr2vwpuwFyJGlgjfkT9vcMmGhunpt/ySx3bSU8lSRPZDLtoZVdh9Ei1KMvua9hHxZ1dZtGX54zqfTanv3teMFqzcyUShV52tVoPKQDKiSUcpS37Sz71SZgd1i6IjMIMMupecQ/7cdYfDmPlV022ERQEv/A6DF3QCyoKlxpQbvi1jvDo5i0vxPAVMIh0OAVoNdPI1SDJqYVkVv2x44mzb9oGF0rQ6LU3aYF9+ISR71z1vEfqDfeQmrxFKl7dQYe97vaudjKnvM180j9YqPiKOV8IVjyNpLxAC0ratFrnUI2xtDI5/7ipxADTDpl4IskpXauxRyRR1iX+4IrZ3EH1848IZmHNsuxQTaXdBE7Zm3YxRzw/LO7A4055hWVSXSZxoZHFYvkJEY/O47XL7dEf8jJz7VrNZDBVreMb+ERYDwpu+EXGl4wkeW8GN8Jw8FjPw4rScd13f8NXq8IIabUcYymZ5kJL4y8mnqt0KatkxhyfBwAiDn+u1ZTNTmQnS6y8T05XgP3lIVCOpzfWh0f5QQLdBGAvbUmD9/OqsDjrQ+e2DyC1Su/lopyDw3HstvvAVsiG6nRCWEQz932i12SrVVnE5R5A66d4cAPsFw8Sf/uUXw3AkSCsFLPf3iOf+FPqCpxIdN2OBnVRYvDdd+kNgVfZ0gkgB0eZ4wVxbFveJk2CcrPPgSe0Q7nIXOwQ4sQ270dmMqBAmzDr0iZ/kSE8C7wIA1QRidY4zoLWE4ibwGyfIKiftvzRjwVJ+7IDIptL0j30dh4Ar2Vn6dfJdwpdDNTBgHdp/IdIxVK0p/aMhyufcgjKbSIqC5E/I+RZ3z3VLkdI/azBap7SdHqdbKfisnXawBXdrIFQITyk+gq936cAyjW1HdQ0ZYe1ZjuBMnpkI8tH75D5OXp2cUnc5Lfiaicu/daSAcH0qsZsAleRN8RGpNyvHYVOR+JqIe042PI9oPp6ADKIzDjrb4mQPvHh1ukWiwZyUd1fUQZ2AaS67Ls9IbEpcq2F4C+6ex6GstvWbKFAKQyBf1W9sDpn9WaeXRLGOhHuH6LRnYcSovFif+3JeINbr74c08NqNfo3ISlbaMIoftXxQZPMUItEzOVCU1wdVGigNlk2I9TXKaBQOawsaZGpsYdZAOESjsteUscXPSiX67AyFs9KeCl5YZAJ2Dte9DPRH9XXZsObLdANb++1b63Un9XU82Hg2uxswpy6JeoAGVFbE3DlNp33Jn4C7aGKtR0YKqljOP9+H+hncswfL4g0Y0NgiNzIYWk83+cvZjUB4VF8B+BRaMLnSbflzsTnBHnQqQFVjVihybSxECpixJQTs+Ei2tPzMKuP1pZTEC9vJoWAMI0bLWUXjtyrNVdt+NUHseKAdrMEjLhYXBKqO53lO4ZiJHPx0jWG/fXKmRevcvjP/P+eVoA2Y8hG9kYoMpz8dwi3lQNU/lk/u9eCl7wFJLi1IS9B9L34m9VIewEkn9HvBJOYEPxnOKIcHGBPSC4Ijhk5Vq27zfg1kEWQxZAQzTyohsqGBI9NkNXhbRYAafT0PGwEo1343w6K2HR/HTRWDRL/55nZPZIp9CyID0C16NcFTNQKyrwMr740hZAG355Si8odWmPuGsbtY3WZA30fMMOPgMYU5jwKjYAh0nyxORxeriD7FtuO0sDfv0V+Rvtsc7RZYWvGlEg0IqZ53/iLdoBMfHFqtj8cXu9+gihbb5e1Kc3LiML1XDoQZWGXieHC5XzPaOfwrHYGE1mOJGrBNd2Xn2wdGXaDONNmgnSUm4NPjgMdpeYPJXwsmj7VvmJMWeO1mNigs4W1b/jARzhTYCTLp0f8hN2xCOgr3eiPtny6+1ZWBBoX52W6j9TmuXZMwnlQRyjmVq6Vl63s72kVCYxZAcfSEbZdMe0GqQvyzLKj5AjQTMFh7Ow9Rcrk2FmugZkJyM0qvqPpQrE4gyB60cIBktoMoAA52OoeeAIfbR7rkdRV4e+AiIRnq9JtZj0xAnaEbP1gOegkkGBgNdVYeRCT6ZQfC3cHXmidxhEO6jRdgVAvRD4tNHJXsDBnQqVfPT7OC0xZm32fgmxAb+9bZZ7KwVgw1oHf95e6a54oWzw6N9+7u8GOLEIo36e3KZK4DCRVy7CQQuM+FKjU8+/riybxjTgvq5KJ1V0syxYXfGE2JDXsC6HC2PejpZpVVYbEX5g5BthjPF+IJerXY+KnJUPslrq6CjGoci6EjQYtKIJJRQ8++3P9frjyGMPLSzbwtn8Ave3+ZFWiDObrOTjIL7H5Zf0MDbFHmjMQCnaKqTG/LsAzZWUok4ElfvWZJKwGuUNJVjCFvWTSggUIh2FXBLRYJacjDgaxNuu+4Aj/pYBeCfCiBX4++Gyd5+SpT8szcJYiP8jgexsMRFU8c8dJwO0JR6b+OIOhSL5fjT/TQNJ8RkeQFXfSILngp/Y/AkZ2CATGFbN0f+X/1Xco6eW6EmaomIg2FDKProfPZCsNoI1q3nldELENEELbLLNuiZIqFxMG/ha+TWaIwdF2ixzo/joJr3XcNWy8fCGcDosdZEgYBFQoA7SES+xtrsoPriYUgx9FzmXbrGfL6bIubWq1oREkwO5B/YtRP81qaJNAh1upRhk4uNS/pL5HyNszYGpAGj5v1W6Yd/AkVjXrfE/pfJuJF3N66KkJC2t6xV/igzOmD4hMx5AMaxtpdZRxJm4FphkhjIPWZDDNCzcS74tjMQnIyqnHM85XStmcU8v+1uUz1/J0LqSD4CYRxIa9QqDCp+X35Qr2wqU0pNOhqPa7lJMgA2G2cZhgAGWWmXty6EhnbS4tq4xHT/+fStMiMahL1ZuUbAo9lJViZ6xToAd2X66xrmDO21pNaGXMnKZlSrCR7MKuBIGhG6F6d6C5pm+B7CKc4Z/XRAOVcyGSI0Iqy6YZje4UjQtk1wkgl/3QHdx+8D9K60phk81OLvttnmesR3zqFQjWBQWU1iBoqYHJ67Fjv63x/SYm3jXyxobFvrhRhcUbrR72kahqQ0UFbbOETtfRKttGrr6KVkrYnZFj0yDsDYtkMSl695IV95iILTovRsKENYvZ81CePlkzc0qQOcYs7adcPz8AEDKiLvsWepf4W47ZHgdowgT3XoLhM9AJBkBycxvnw1pc7nSF/imX+YhC+T79EJVrTx0O824wJh1776m4D+cgKxqoa4KNNXtu5ecjZAgLBgcMFxo1AwB7AJuEvqukRSdDRE6acmmx4ATuQxXVS8jPR3jPQNpBe/D/kuaZ43NnD4ObAZ5X+62Hx/v9FYBUot9f8im4YeIrWqFWNiDzw2fHM6/UICTUqBaW3EbApLOtS4edmpjMxZkBjdqvzfRfXD9dAERQBdAGVq7DXJ2Tbw8zqNzTORGdeseSSXn3InQXvrIQS0alxDiXmMK1Q8mYWuldQKJ920/y6JcN1990t2j7icccIAYbbcaQ43UVmbZ0g1ow9MISXo2X8+MA1j00SaYQ1Qc7nb/uAqkmKSS5AQoBSslT7KDSPpwmwBqQv0g7kWlH/omSiC7iBnjCkNnlSQf3VWejYVzkkBlblY1q9KFUCScfLRzfR0rvCwm0wO1jPoofpMGXmYP9P7q3prEj3VvO5UBRu7YD6DMxkCNeII6RwxafUenHtJGXiz8MufTHPzBZJtMrWp2hCYTKnPWckorLrREd7yUQomKBZ3JEoTiyWo+AHMqR7xYhjNlkfbU4PVgtrjDHfpt5HVeTIcJaIwHxgyS4NspVY350DQ7N3LLwEoEsf5dVmXgeQuh0A/KA70F+otxwOQzoIDyQ/4EDGQUWXfSQBaXJfHCxbdiLwtH978hLL30i6+ANUP5935RwbUUc/xwcZt8ab1li1bXwjwWOVqW4yiVHN/8kXiEZtCpns2xWkob+o/IOi68Dn7NZtHMRAjkBqaax0o4a+szaJbeFtsBuRhkOtuhxhjYbIc5GzXplQumJknIe4WVnF4cVX2jl7/dbMe2mrMmeY+bsF8tZM9OC2TzWrjd7EvDcPbkQ+XK0vTW0RmcSu7eosIolse8qMESSo4pt1VsCU1F8YXi0E/qbxvLK48rlz1xyiBoIFg/xt++tVkuAnKPNCPNX3bYi2tfiEF3gJzColnE13opW76tsbZBCd61BN4H9c+aQfNpv57IQknsZqXy7T4zcFcaGZTx6r0+MaaxvJI2Vf8qaUt5nAvFoQ70ztBX8Ta301XaofwzeoxlHnsmOf1JUCSubnij+BsbjFjgNpIDGqN/TWcvivnT77FIXjLK9gd3bZ3SmjElzjR2K0385pNIK8/U9E4HTbALeQYYSx2diZF+jvwURH5zkDWWd1+WgMzCtIyr8/vGg+PNrJvJtizo278Y9VC3miAms92bOOrEqwvoQV2FPvr1poQTQQ5tiKU6//ZtrvTLmQk45TteDF+b8DnqxYfxE88Bt1jE10Xu5rlbNLQp13UJUHyXPzCr1PqmCZ9VLtZ0/cXkjDb9q8qNR97uFvInC5LZFVMWo39bwbT4Duiv1jYSr856W4lU6zo354fiuP2dDD5VHFmFY+tfiialV+RenmttE8hv7dBBs1UgidbYhdM4L/3yngW15MOLqcE6kCrQejXE7NsZMQpGrwFYD36PKowg367HFQXv8aZPuNlG48T0KSzz5bU/3tvD3pXXsdGNbgqB31QHCLdAF+VadcNjjjsu2DOc+CEGSvfc9vbHZk0aEE/1lB1118EIbUR1qgfROYMADYYYQb8vN5M203Uv2sE9FoHT1+zi6HwfIzwrzzrPA00d3ri+QWEoLZXHoWCpKbzDaGUSwgclo7OTxOwtv+zUfzYD1J8iIWf9yYm+0YH4l0TlBUrVDeflOP6LwIRtWfVXdlOfNkJAyP50xLed8wGt0Npnth0iaOTVEclp6fKyj/vnbLO+4tDaQJVwRvbarTpBMbzRBZ2IhgPdmfEpfbx1K9XKqyWlGtRRsrxjLaJJRhY1EQkm+iDBGJv11RsAkWiGphdmsL0cakIK/kikpV/sr3JY0BS1iLLJGDLgSz0RgGQ8Y33pVj0WwvWR7vScEDFQD+viNL26s4sT78Jj4KBYanCWW1nLmKdMANt+HR+cJk9TBieq/+woTgx5AcvVkhRh99zeOJGU7DuQRTOyOetCGRH6QbGQ9Rb4LnODfCI5aUDAKTKEKttBZ96nN4B3glbPAX4JA03hv79/LOuNRkCLkhD0DcfXpVcrEffV/75IzdeWUhQqC1HxMfq9IOKCK/HcmaiexoF/UtsqfQS3JH9DEsQhzLo3cPp27hzTYpaC1gHL+cicBmdnxNiA2GHcX3+FVgKIBpRh9hP8lV90Mb9T62ZGPQtCOlzw6DdV388SoVl++3xqEnEp+vrqmd5vBY00Pj50U4I/0UGHFirFk+Fd9kQFoPpknMNZR4QIMc+1J04Uz5oiJfvNFM4mCGVzrR/dXSshASY0pJZZJEYV7FusaSNGKa79FE8EKxDfy1UhRpPgEj7bVGZ8yZfwTLwyyNib2JhbJjY4BqpL42H2vRgXcQMVKwvbiP2yoxqwf3tOpcdhjku51t7u6f6HwVsGiGygDG3hlf1POzd9RXFEX2uNMrOPqLDRIV2VdyYhh8MvHc7oBdkPTEzXhgDWkG/2pAuIwa6FC2eHBOvZZuf+NQMbp8naWl1AqKqCq0LAYPBJicJJVaZ8SsuxX5AMtRjop9rOL58ikm9w1y7JdyXniDq65hLFI6KrktNDE+d0vXQzjoC381LP0QR739ompjzMl9GzAV/iy9s46iHrsp2RGV4u1y0MmK1aoPxtfy5RszZkIcvP7jUqWp60Oy1ZpHvMG0hCS54JvoQxdeyDtznz6bT0BGy9KC7l2WEH7Vm1+oQl2jZY/dnBav7HR3EN/eYdEEwJqPb8sVo8HKKwy3Q44NLADaqaX7lGf+bUrAHYfTud3jmJNTlXmHLh/JVc7cW/N6KUpRMi5dMa6fKBeTMHe0JVQQZ21rUAc1Tt/o9qrzIPB4reSZKuFcPtO+jKMqeyMBDIQfs6dVCrsWxqkl0S9IhDZL7yQIv8QdCAVUx4mEN+NhLyCu4oLdOrEGiBk2jwzuvESnCLnz9OC58uEJYdEQHC3MuTOS1xardsRWinw3/WiRDHD7pfVpD5VEVjanWSfOmF7/fSWz5uqbrQqoBBkEloUT9KOuThCpXMTTu8lazV+2fMfC1onPkzJ0EqwK2N2H1yc4jUppfqLSKkdqkbNJG3Z6AxaOLfjacsWxRyOE1SZrFkjHw2yUkUoMXEpyHLoKiY4PfC8YEaS9BJ9EygtiaKKflxZ8DTjrOV0SJ3OjKBBn+i/TODuSexgDN70rnzSQf9GGOLGF8E6WC1uF6MzXrMK6dW4HYlLnibYTpDllX8oYNPbcpxUOeoeGT9Q0c0imp4zK8MXlwQih13M4fmjz4ZNdso0VmsFMqtIVrYEveK+LVF+oABa9hVaxvwCmtdPUh1tQwLd4ygvYSq/BrLDiWGix+P6Uai4RrFHkINWy17loNtxPsIBwXPAnIHgVLCVnuqJJ9cPw5iiuU6WzvFTmHuSemjIqDJCblwdF6FeGM9oxL62zZL3XNqbJe6uYM5n7eNHRy58l/qzHfsNlbfOe//PEHXT4vdjYybp+2mKeME0CmwS8jJ1h/rhJN5cKPTycfYmD/w0ZLcJ7z6yIq06ChlFsV45EdjVHI4NWoTAaVMzRjipaP0geJsXgmafFdeOOyjqwvYKT9e6+3NAwadTPTWiPqxCaXb2yhCo+cUXFSu5Ov674ZqUdZ4bSJ81Vbq1GdfMjfjkxjKchk/Ukj2Xg4rO+OB49IhaPCT3VJpM13IQhvspyy88OPi3mhTUunaD+U7o4RxENFtDLAQwUDwzZ21KtGBb766BRRdMJ9a3cKq4TFLGwJ0GEK7r/lomgonsHc60jRm5C3cyX8tptZ1YY76Q4uS2dZkD8xe8Nate/92hw8hFtkF5Vyky1q+ypYIr/YSUB0M9L2Y+SYZsc2iPhLfbm/f/daWCdzjm7PIfZNGhCYj1Wq+5QTLVC/iv/0blMsv6wrRN0WS3GYle6xNe1xo65xTt6mMsowbs3FYB2WuGTm/UQhkK8m3C2W3xG9HVwOBRAWZvbjLDdp+6xPvzJQ/c4GrJ9+q6aeHQs9dcRfEUudT02lTX0Wx05wsrPDd4N3yY1Qn7pJHBRujatpQhEPrDTgkaj9MdIeudslWVjKo0rrf4fTQCLNYqQ0epHen9cm86bMyChlOWecXiIp/YUDVu/teE4a+jLLGdFphwWmcAkHgsfptYnWSnff3HYszvRNUmY8tf9+1LB0kNZ1o/5dhU3po0cSorQFjKSQGrD10K7qCGaFbcbxQ75S8bi1jMJECY1PKF2BzgUhi7J5RraGEPloqLmVeVAEGkWAmjVlj3WrVrNxK/SpW8IOmGTrNTKzS6AQhk0b2VFT27t9agc1NwfZYZi52zNNGLvtYCBuOpOZbkI54/6c1DSrQUNS+ILXERBAlPTg1hkG44B1quq/b/Z5V745iHxLgtBxZvAuLodhBTcXZ4a1RIvg9yAMUjowQF4YI4ikGxh4c7sHAr55Rpk4QMqf/by10G65DzqRClnPcri6vWtp9SXD1AufAoLaiBlSDOOHZgYnay9uUJF43Uszu5K7fHW0xGSCbkrR96JhWMO39lyHY6tdcrGrV2pKnCoSwyEHThovUW4wbvc5UIhky8zwgvKR0z+E4hbM6CvQyeq05Rd6pdmQnEs203txqDaF/4KgFcgJgUm95Yuph/yGDA7Fg1dC5R4W8KpA9SYJN+p3m+5EOa3ZzHEFWi29LVj8a1YLr3wsU0c4cpPD/51nxOAuzUysVUs5jVeLy9fPBBG2odD+DMfMJz+AydKYqDUHWtKHoAIhBlAUmOJURTbA3w4WT+wchP3z8m+0MNFjOKF32ZV0s8x/OcAPebKLxKigl8+e35C+jk9YyjaYph72lNuS9PL9SPgzY40TSoOmmfNA3+kfVP4GhgDo1oVBH8NU0lwl47kBXJVWJTyM+tb9lWt8hpLhtpaOsLDsnis00IB+Z72oWtf2RwoR4b0fPJojQ/Kom2jfEXV1DIEjbWdQ8jgOrtUNRSDy033Ga/Hn4WMK12EALdvhfVAFoYzB0hnxdTK2B5581YPvGy4Pvl2L+2W4e/KOT+nvxZOc/1W7E34p48EFcabiYwhRAe1VNoiXEeMdzwn0MQ/kCaa50wnkqFfWYVYYCw/OCWwCRy+RVGSnXei7Zfxhon1LNxdag589z41Gu70W1dyM/JseFrNvX5jn29TBsqE9rgpe7Os/wQXH9C1sPdtfbMwaT5dsIFpgmYmUXvl0XcDDD8WUcKWjxKssAuLioaXIOE1B+ni95z4UTA/1EXt7qGfBFELj8YtscaCqGogkog5u3WMCPEWwq6/RzwxlzBGsBUAev4oyrLf4p3y8NoUa6WeAcyDoKJA70R7u0lnSGYR3Rq/76mwyjS5bL1ZhCsrX0ZboycLU1QeX8yrO3R1c5d2IfVzN3BxSIyXeIjR5diQDBBc/aWnBVo1YWB3+f7OQ9FiQQhXetQId2gCpb2iy4ABDO7yVpP05zAPeizT3klwBdgbp+mCd41IrL+/3+xhffpRjLFEpecUWO6ASHndoUeJ83FnHsZc8mZMcXOBwH0WdArq4v7h4R1NapDcwPxeVWOs5hwdpb7QGrGObaOll4zSDqpe+jW0s3KbOmeT5Ogow9KeNK/+iBCHnDFoRJHr8x8dmXFQtwTdyzK2ZSBXZR76lRmUVfd+B0zyDGjvMchWUy0zebc0Sdu7788bncuHcW7anHsXQA4qeCvO75wAl+LxY+oHztdvkhDSdxi3hr6n5v3nXUpeXze5SXvb7HxeixuyUKZ+T5XIOfpWJ3J43bxBKXPFEYkmUwVDkoNboeqV7bGkt9qIkzZJyVm6k4fe7MwEIOiUj2ZYPx8rINzS13tR3hQcn0u7823bEGJNw4zkXHQLntb3THSz1sN2rJeOrTgripz0T3R443209vmpXIU+ty68l+xiJV68urrwM8ycyWoPixHSig7Y+KhtPRu0M3QpoX+1R6ICn6qSFbNfk6WS68OYMTeYhfrfVAX8DklTNdqcJtZ/4C8ae98C6pY1qzgm4Em3iJYq140Ir9p+QUJpv4XIirFe46KL/irt0OKrh3BCdbjdgDUzhDLfAyGvzhXWyrW2/2yAn3liSRngQbvP8NJYz96gtUbO3aiHhD9w26Lyr0SRcjzc8v/0mu9/eOIvQwcAIQGZ74af18iMK4pzxi6AN9AL+npXNUw3t//9B+selhU+3EV9vdfpBG+ucqOhOZQ9qFNhcbEs758y0MDFQ9JXENOLi7B2in+EAvfXNAjfxr0fxqeRSX2M24570T89F7bYywgvmUbunif1Q0kFx3F2uNBtx3w+lEy8uLSaLBrU2K6aoRsS7szaQIkiJEtTN5SvPqvmR6pcs3qLv1lKnzYFTLZFOsTMljUOnktTRgGXWNLdi78Qllo4FjCCudu3WQvOKbAYYT1xtG8WDhOrKJG8UPzer3ZtGVdaytgum+Xbp9K+bvJPAimkW8OX2YHMnAvNpLJ24u4uqfuNYsRVYWeEqL8tIxPsjnI1Li11rxVYUQb9HKLzI3io+zBjTnIRln/y6mleGmL54UIFDxgA15nHmEzj6aXm4weBMMVuvbYHXC5N4ZJej2xKx3EG6dYlvGtW1Xb5As4bdEBc7dq4L/lVB0AtXUSwrqh0X3X/nbk673czyWbQVMzeizbfRxDkVE2ea2sToUY6JZnS2iSoXA3cHTh/IfGr4QQ0hy7VLACJTKBmnbLkDyR6hMZKXYvUu+CX/UY+eYMJqFlG1TGhIPbEnclFoB3pJFR7vsxINAJkQRmtI2CQ8Q+hPgsmra4Oii+iZX80oqulEUNSTbpRSi3/c2mryVIDc2eWyeupahw+/YUiKvVLHtUX/xKK4R4IJaf5blu4WXfGaJJZn8gp9KIVLUcBq9Ud1cyypDPRYMFj1QSaGg/OWGkjmjOkr1ClWurCN04W3AFvufQ67QXRKD+9oWXk3L54drJsGm6eVQA9CfupFgCFr3ktTb5D5g341vxnRf4LsKDGrYHlbk7rlGPDGmJ0aqtmn/LmMOWuP0ZLsUIf4FwwbU73w8uPkAVcIUvPtDXC8HH61BC06OW3HfvcQwqh+elWSFp+Rcz5D/3sAEMwF6a4P/PWTj+GC23w9moy5rcQbHLrbb6em4Dg+qQq9a+A37Ive3iiZYXCSQO/y1fxpYwcYe7/HQJRaMCc80TC8bs2qHeN+vpHi7KN66gKy4RgWAClEOjjk+Ipmogw4InseBSKpD/VymhFL4RxZCP+XBPSPmcHVp0mFBlTKPfK/Li61f55m9u0FKLj4WIPu9spV5pbOakZ2cUKduAasFpjQSI9vA+uLPHrJD3vCX7nUdrkIEmbgfCxnz5mr1nkm4sM6SKbW1KVDcGIjX1bsvElCx+aSqTwvLW+WZy4fuKO907L6PSVz5REDI4MnGo5AIX1qASCQB58Q+8zq+2RRAJ4XCnet0aT7WNfkn5Fit6BVMagj+tp52wh/vPYmQgEQIELmqQyZXnr7sBuky2l7y4A+2J4YOfgMZ/d+ZyjM5gG1audc5fYEU4b6/rbpS7xqGVu4ducD2ZNhU6m2hIqTYsNJyTW9OxIbUoQGvYZ+UilAHB1Ro9vkhosLw0IB6H0fF1H5RdQBxXoDlvKRaPY8/6ea1dBnzplhMoDC42wRB2IPd3D9NKrC9GaywP9tJi//g+3kx/eDHXXtt0N7BuBeQ/KENU7nYYEJVddb237hjqVmPa8W4kz6UmQjpDqV5VS5fhaYfo3Qh+MZ0otCkXTiiKk6Q8fFsHhOQJgNc/7XEXe+znrOGjoT+k8j8wUuRXAAHc/Tj9+YknbOkYV2wlBdrJVe7fUTPkQXbzDfrmJYlTsKyEeFY3cO8CIdeEVq3SWT2ehowFsva3kH7kP0OYl4DbfzoUK0kb7aEigYK8RYq/vx14BCvpbPkIlU/xVBmq4YmvsPSKOGqM9yQO9RFL7f+1PBMcZhItFXTQYA45dBHnfstTMSH1UiVa+4oT8cXxapWYfXYxqYuf6VqwVctXdvnuOPJcNuR7/cEIlVWhuPrmtxS4FS41OkGozeI2YKQCTOgJTODUW1zrwaAnbhaAmcdjb9ipvLVNk+GjNH0y4DCWAMwXkbX1U9huEXa/ls0rcLkD/0UJuAD9zrnxypnetSqijz/d+aj0mpTWvKGCL/1Rt0//ZaVEDMBsrL9jN9bh3N/zlAI++c8BUHYuUzK+IT6hyTeE55fsHjYSeS0ZZNZ7E5VuqYPPJDFoy2zORowKB488wrIuf6yeFLf4AeUzDrLvZZuUssENpIkpuYO9cOHyDjnAulKRiA/18UrIGVD91YSET/rqmgxtlFXOZHb23CpfdKDEAilLMbCeIWotVTEVXLjlBhNHSZ6xQQK1wuZ+ua8cNqu8jscJ86mNV2O30GYWkDCnENarCcKzRxB3lA23FJydFd7f3yr3okVkQhBUA3i1Qq0idXULCiZXN5GtIalFRe/1mSe6HyK3rx3yHXsmKntNH2KDNvCwonMmMsLS1qznr034krMBOxv5p9y2aDOQSLLWT6oyZhVsteDNcBBUvtYcboo8T+0xtQiLDQ0hz6mW4IzZiUKxIwUpb4tQyUtE3g6nyUUgHNe6OcKQhG6AKHlwnxahNbWj+aZk3YtBPV4Cq9uuhjkc0Q6rnjs3Ab4spUvR+140225OStv1VDdgJZPLMU7ebGwWZxu3Ou0Xs/M6xPwlUIKYXVhvT6ohYSXcwNurCc36IpB+vV1mJxJ8fys5woaT571qzkIUE3H54z6JTORtXOlB37UD0j1+3jC9Tz44zRdvLmdtQJq/MRQFCSWJjmlx4xCRQDEMYzBqxYJb03FQnp8hxXoPalEho6bXea+E+dpS62dgChyE+Uu37bP5X/MXtSjT3yELClxeeWkZFcXfm9e7p0NshlGFubLtcgpKcgp/TWEQ8xZUHUHy3LnemPUxhgIWVeDom2kb4WosDvoYua6R96DR9HymoGZj5XEE1Too9wSlt/2pJ74sNUnLt+K63rTSng2sGbcfGcVjbtCeiCfl1ByDuL1y8ZnNUHDgsRax/+aLu8s4lWIAhi3fzrsd4n+Toc+/OjoG19XmY/DskTxm78LJVG89Pj5ioyj6XLvQlSzuVbHRkkkGCd9gc17HYHgEZwkp649A/QfN18DvmdEwnOGXHFfzskQYzuMGUochx/Pn+luzXtTfwOWvZhP7YkO1ck8dqut/h8boOWwCF+/8XvLlUOQUO5i+kS5g0iB2dUP1GOh/7l94MKHkkmGN0tC+jfcpcIdHDSErn6SFMy7Z4NSuZzJVdF+AEKhorstutePKqL9Uo75cY5VD+saqdHXjcGMynQALN02sesD+0VDKvCKTwEjXiwuxYzqiSxA5d3Hqi9ocE80DWD/H77LgD+QAxVnu5exr2PgnFf7/z6cYXVP7GYzxl0xj9j2on5CQjdoEraSB6CpjS1xz1s9iDGnVDIQhUzznDtk9TMyGUoAGiqfEfHLu144yamWHLpvVNSdbhmRpkd2D3BiuveZGFlC6VmdHtoLfyQJLLtMJa0s5Tk7xzYVBdM97/CRu3vanxcljbpB/WiDw2nnd089S0ekz/YPJmZxmcARQCgZZHOFVptJfllSA3mQtYaRl0Atq4WMFguxv60axOLO5nIqmMYd5WyDUcgV82OFsd2fb0U2OrPxWKiDMy66wUrKxX1AA+trWMlgk6kDPCnuFfn7g1fpwqxYINP14Keg24Jt5GLgcJmjqCFl07dA+qvpqbbZoCDXpN+2kYYzvkBVrddFg4nQ9SqBEPuIBFiv4XuNQMQIlrKBGMDB4oAH/jm+VlYqgHo/XMZIsFVHsTpcULHeoL6ihiRvgHJF562LMTQpNWNXYnvEXNFDbRcDTjepKrxMVOOBLHsEW9iw1jhednzJ1609NAHSdeZBRMmieb0KYpao5FGg66eR1c0tAvnOMQzHQfJWKiUYvTqk0R/Rzg7/zotd0mGmmiWDceIomUgJvWKDFSdcoPrpFZ6JeBpBR3fL5o+YjVlkMXotjtU1bKNjT1NY2mRo9EDruVKvFlDt1qQJNPa383JW1s55aiiq/OspWRBClJds/Eq1ikzew12IPF8eGk3WYoEzq1lFjYIJzNQ4lVMttaHzXpuG+Zs7gSYDudlp1KXS58tUkX1MdUdATs/TBzr/aSHKAqiMrryhGFKGSQxT5dS+AJJp+AAQVt4Eww6m4la2fnpyGiM4zQsrEjo3CJarfpPAM86rYjV28qh7Wo1fDVl1hVmk95/nN5miRDgkzYJmNAXPGpbvlqinEiEZNPSTdhxUCCqZh/K4gcHsOn9t8mJfMCUm2YkReJAUSDZGdigN+zrk+usMrp8xumHc/jKSANkMBskfcFo3fZDGuM53Ntj+GFXRKCkh789BuGl+6L06dClgOHHMLZMU93oea7ahiYoEHXQS7SceEIUfeQcS+YqRn9Dx7+snNK7RtAFg+zOd/jj9P8y/4uOEC6/S7cpKyy+jKgNNDUoTu7odvFp2bRQJQEdUA+DcDZAAWzv8Q3r/w3q/OorYzXguMLgRJGRlyb8/7mz8OX/n+172NDqXbRSuaR10yqjU/5ydOhfxDbcPd/NFrp9oMkV/pdjko68QF0y9V0tQvFnfgYpyIX9YMzlnj+Lg/Ax8FSaaPPGkqIjhdFx66G4NTXCrk1J+8AgEWwT/7u9krhU56w9ytBcDVAotudalHwEmO+GzT+aLVJY/DefilhsqVvAryc4yqo4c74bSi2R7fOq2k6rGTi+ygZ8MY+h9sxNK0Zism+g3dMgddVfyncz5DLMhrC+S2V32E4LRhNQC8SR4tWDdiDinRPajKnpxpo3Sa2jYWu6UA1kip55Jv5oxgwbJaFJBOCW47VtuuJU5JCPo69hmMzhdSsjEeqERmBR+N0/dwjGQuWVxCFhvQmeyB93Il9B9kSF0KN83boGIm/7LJVVyRz81AEFTdUtl0S+VSt5r+ugTAWYsGGpOedmdxKa6SDh2ztXMyJG/1zGfMzJ0uf5Djvy5R9c2FEqN8P4HyuW0GK3I0WajrKVB8MAeDnDnzmXHpwMm9liuMpYgQtFrNDrGj4fGmLSQmPmPbDkhLFMu4ldrUjWth1RgbO1B9Cu4QvFIJUMzQEVgJkO/U84ekr/sEm2YJKP067Bl0Onc8EQphfPBcs1LGhdS5KsqaeFbtcu+vBrk1oiKwgXHC0fjYaiZwLOk0abF7eIahRHGivnQ7uOARGW6CO0yhFv+vLCliJNx4U5dUlvAQ3Jft2Ujy4/qwwjb/VT3WKv+12JE3e/Xc4qEbEsbNEZcZjIch6VQQoVbM5VAeoBDBI0XjHeIDdcD4lL7viTd8O8W/e/XaFdH3TORyLaHoBWYJwttAZR3p2KVkQtZpzYAhfqbSBCh36Xmpnfj1R1liofAH9Z7GxFKsrhMRl3StIROu5tDsjrO5By+Dt+XzsNogJG4TgAiflYPCht1r2umhiJwfpRYQIB12pJP4CShO6MpYH3Y1FHQ7MrkktK05yXdlaF7Pj5KBenaOYiWnRnu5bmvpcy9BaA2ywW8k+O11qIFYDIcgGiBE7Bv1u2L4IDJuhFYx4Z/hAzD/wotLTaMAL2oDaAq5KdGq55o7eNWq3E0+LaJ0LeAT5yi6t6JScJnP1aLNa2AgJcixIMcQbRCX6pIntjT+nJQ8AZvpqbFIUofQWLbYZ22zKqlmgX30y2qgwGCOlpJUyJz82y67RgZnH9DDt4kZ5DER8SUHj+eqQvuN/3wFcEPqBG9u/Z4O3qq1Zeo/yT9tH6xY5f4zpbbT1WxaFu9yaLSafyEWhfWn48YVobQjpg26QL335fTF2B2o5JQeaqsNG7day0vgSW00nCBBWkq1jqGAezxon8mDDloMkkizK4ah40lmtlI2G7pKe773iDKWWmn/Tdm9BS+0/ClYFszTwlLgFdpcESxnB2LslvzYgbBFK9F4WWjPi8NTPEJ78sSRBVnMc9h7WcYjQe92XpcLLCq4EdNTUTVhfCeji674XpfYEVe6NZy5chFpgxnuDK6xTNRLYGifYKS00nrcPRlkjENP9gpJI1cymL67g9/O9GPNaSTzOeqMesk7qIwAcKKgICB3D9T/A1sfBb58IiOKAUUEyv3kQPwTNRSrp1YhNd1wc6miAJFayxmUZwMiN/gYzYi7CfQXg+DmaJTMpybZtTpPl8wPJd8Y0Ec3IxBK9FBZhdGvW/tq4hkXQACHpkFCr4J9T1nI7KNICy+aAeIltCXmUo5+INg6lkubusUbye9nVsVSQAnfuSHjdfVgh7wEHEnuccm/FTo+AewaBiUTf3zTnCSUxUM8fp/hudiP6sFB2CM8LqDIbOv/FU7XrK1/LR2lbaigxv0GGbGpqQb9NfnBgcjh4EILTVVETCVML+97M1B9b9KLlNRryUD11H6IWW+55tgGWiBYDDOkyP6NR8HvGwI8KW7zKEvYmKqvgo1jJl+mm61v43NmwRl2caBOMZ6NmkxhsYzyCy7YVsQSF5dRQff0Vi4B0zjs1miU4qmccPEcFZTWeqVv5kYp/Ehd3JvVUbnDU08jn3Gzog15w0/HPGh71D7J5/lL5DPmerIf0eaYexy/krmx1rhwMOOghS6C9jvSRF96sqcEPl0vypQwwxPXjoPprBgo1no1PPqo5MVEunc5EFGFrCG2skz9M9ARKYBuwDRgnAIscjvyezuu4AlOYwwEKVs/2ByKW/YxS91X7tV11hyvLE6AZcrTlYQnCaZyHlSsNc5lcOug4ixcsWj4l+tvgIxKd5wPgrgDIg+CjD3xDvSAW/ZLhObuxRn0ig4NQKpg3uCTuuqfMWbA7wkH9a1GIartSre4GBVRy7xUSCjXD4lmOA/rIhZAKlJfGfViY0CAa93GXg9Edc6xBgh3MxQavf7had/9h4QPeLAHXyoPbggMgwCtrUapafhOgwBeu47xzdewvlOilWAF9Mg53l76sglw0/4VfNSAjnvBV4WUSZ25464Fdg18LRETg9oa+Dg8Rzqun3QZuqbG9pl0CZYUs7dqJgsT3kxU82DwJte+vA+rk6KUom0Y0vOTR+f26ayN3s4DCZZ5aoeYhm8EGSItjd8Z7G+KicSMAbE75I032Gbhp1tlW7PeH9OPZDzo1fiJzpb8lkpJU4CENxapxa0f7IRpSipT+zcACsfUSzEPfRxjr7uc4YZhqCoDKa5zOaZwa/uHsB0gEBZOuTK5j+riii57JbPuszn3zh/JW6Sp3uF8SwY+SmJOkl9p6h+6DUWmPE3PDStWPQS9R9ouslPnjg3Q0Trm40RTjz01K1bRKikO1lbxGprjTywm80rPXvMOQQXl07QIBdlAOG1lAx0lSxsYqDuIDJOLE9DMm/1kzdokgDUab3H1g89E5i5GA6eCiKeYNwtxnMTgQH0Rqas60RzL1eaqmQljZ3ZioTO94cC9kcJyL9ytw8FfDurGhVD3w5G2xnQUYFknyCF4JU/7mAmSUV2i3AMHFaIiSEroNK6zhDeUAJSrBlVDjWv3eVckvLg7+NyEHKbUg40JfqGZ2sZBkwK6gkuvKyrbD0fSDEJDhQAFjv98cD7+D0uwn7G8O5+SZOP07mP0Wy0w3lAQPLLD38R9+hm+wW3V6WC/88aJYwhHo+ZdE3x8pb9yiZZCucKIkAEHNtoY8I0XMPHeXUYRGsT42JvcKB7wyxCYqITfVq/ZleBpFHK43YaA18kfJyYF3gixEfyfVFnvD32DJv5Scs5MPgQoWKNZxV5V2UJXm7XQy/u0gETAC5lHFHnu3KrADzZLL45W/ILlgximvz3469ZM1Ksx9Mr5jUnOuqtFS24wfqHIWYq7vAbX0osI2x7VvbcD6kPCOLDbtNVIcE358KUE8l5zs8QXmUY1nzQ7+7hfTegKOXKqPxP9CfmJ+S0KJsjf3T1woceur1vJS2kdPVBXH4LBzWqb/BPztv9olTvt+N8BYKNIELSXzbq4tFtBs+gBiF5fh6D/8Hj2T4hgypjGHeOH+NB7OuWhqLmtLAAbKJvRboL58sPEy/qC9+0wTpE8lmmKRUNmqNCuPwZuvM+7E/l5qgsiRNLIl5Mc4ByxjOyxUly3B6kyZui6xakKRVNPZ3AzUQdsNIIgWsZL5O8Kdv7wCNWS3dioTpP63LBZrJqJDahmlybbEPbDKiOca7oZscDWRnmbB+7CYq/BpPVKtVcqNKLncU37LExX/8aD+RVQ0BR++WBpRKD5zqSLuzPAATJXU4ol1ohkn3nMi1b6VaO6aB/6YtPnupdGWsYYC76cfdC0U5Jr9n0aQGQNSxkF4ur++94FumkzndhGbhRyy64kuBIj8bkSJBJRonXlEw4VsA9yycjjvgWgR/oefUN21PpxElQ3FrAApDO0XLJa1GuDzCPjGFQst5ai1KON8cJSx2iVlRDBye60gQFqTMJgdFKz6SgINpm+ABESF26+47ImfpLfEGjFJEa2LSSrHaBzyXHTS871kXrYsMwmg7EWPFuLUTXPs/sgNsGlnK5KyhPoizKJis6ogPMJ3OZUnr5dD64aUwP7yxJZ/+44WsCjALcEswnAI5nTr0chnx+MM2ZYDg57qoKxTbB17pT77979Qo9kAUqltJuYC5jZeRJ7OZhJz9CMGuscLbZII3M9YQpUXp6hcO4uWJBYeoq9E+YGvGNShAa9kK/7e9VrRbiwsZxncAYtzKMGrfum0rp/IJPnWP/jzw9KzNCElT6ubTLrEYKgY95Nn4nn5WytwuswTiJBYhjQ3oW3tWmmCpR+687two/RFuxSyYppMpPHG1N3fwemIJmoB9U62AM4zfDUj17Vjij7laONcTLPJTZWw45Fukq67PFBO9owzoTZAmrUGXDAdxJ14Kp1jfoiqibWE8eCXeu9fy02GhO5g14NerquLycZD6cHO6xT38OtQXsA6HlEp3YVrPbaLzjxZqqaOMp3tsvJxw0GQNb2Is5lOl/8/71uEE3WpwVqTVFR1oLKAR436WdZswu0esGgMDpfb13bNniZgIqiao2kbQtmh2GhpTEhVZqrK9FobDdrsqnwXDMpVTFUn/H6qLVbzABJRYf4+Vq4XvVuQXMo/NN3XPeHLJXRUBhor790BCGjJw1++Po2IhcQ4mnnttpm6sNLOA8N9WLvPBnmcUNYFjGISnQysGs29XpT5ItdlyFgStsRoM3pu8oxG+7jQMhhHqOBoHYv+rLrxweLBU2EmJxIPr34ilMNSGQwgUB0PPOO5eAJ4w/7KKDFp+avdsl26B/Vt+uFveZdZ6z8dWYh+HffLSupIDO/luoye78J6AXnfPuEo88VY0veCnw7SVhNxHmu11zY4ULzYtpZnKDoPnDmVUENkCS84Izy175YIFZqavK2GcXryODOrkf2jOcNnKU8UxHw/vu+ECOp17v1trVWJgKa+l05aG7N7lPusFHF09546tPSQqzfBLCuKCTg3qYUHlSytgFpiZ+ePPiJVukFfjp9DXa2rjTV7xechkSlxbIOEvopuWW0fP+t2vIadbhKwFCP7FZZUenCsNiFH9A4Ki4xEeAF4CFclVOPWn6iwvu5S8x8UQiaNpUpX0rDxwVCHnTqm6iLzLLVZwIS1yOvYMtPakPK5rkpCxIPvbXag75ZFy2G1VDW+v8iyRai3fHRcxoJR2mf2sqtJ4zOuAnKVYOq3Yoo7toiXtUGRca5mwxXMkAPftcMSbzwj6uNNBnblH2NfGo8t6bQQA6d3J4Eui4ZDeifEv6HMoZOC65g9z9RukEAGUiVF9VWypqPlu5fySdaC8dAzJbo4N/7R90E2k1fFhscRMxaNheJs8c+NjzG9rgA6rAnZxZ4H/Q5IQDtYVzUWS4TI4KkUO6vkH20wHo9a4YL69UuPxI2QXez5iIPrXBM2H4EAHtimNULY6FAmVeU0bgyEuknanpjRDY2N0BWoCRN3wWAFuav1ufWlj3W2sZTeT2r0c683p5lESmOBjXr4hYiS2vNLtfegD1qlLlZr/o6S5Fl7TcuhYNfBgV9dgk8BifD6Nfh8kdGr978OTdyMVqt8m/sM3gCkfSf/G3cI5tNORfVDyP4D4fleyD3oasWYp4Wr2r1QsjRBDvbZKtaq+nRG6lC0xJsSvL+E78we7lGw9EAEhv8LwTKUqSX8zVxNIsr9opffJY82KyDTcJTlffU9GXdaVtuLuE8fnBhi9y/v2hWdzSP9h+ol+lYCNltd485lEiAAzcGBlgo2u18c/WZyo04FanieqM6lV4mqNGgEtDjipnMq7RICicc+jLEOQMuboPSbyig5YeotAP6ITWPgFB16C/Sw9LhU5QpVGOs5xjzjBgg1/Ah4c5aXrWkrPcOq+vIDWyNTEl58ZyykKPGNem7OWQUgTyoolKu3t4X85Zuu5iCW2Q/ebFrvoPAD1mp/10Amkz75jpkf2x9K6ngqZIVmzrkN4cxcgIRiaL8IUEHZ1iYN4LnOUk5sALzum3T9fASbe+ACfjViV7Q+SAsXnqsCKP/uHHa2THXeCCAKIpu1Pr+V1EOlJPxE9ys75rPtCY9Rt87rbMaz0vXY9TIEuF1gJLYTXf0FiiC3lmylXoUDJhOGSOxJyEs1jK0MoneIJEHUrl/jLl4OFCtVN6cu7Nj/rxJoo92jovTOpcv9myrCWLESQVtXqN4xOe07CdT6nIYcmDa3BbMrakbZmfbWPqJZ3s4NK7ieNOai0+ipJZItk87T6fh1XMR4RK9S1kxo0/czVA+I4sh/u4EoUJ4WZQl/1KtMwbyrR7kCxpnUE3L2ze6SLUGTChCx0ROpGYV7dexIOn5yo36tnxHAAFCqvdJtjNlUub6GmXMrS4a9Qk734MVxquOPpwGgGF7zxlClPF53JDUdIr2LnoXKiNsgDc+yAJyX6e8n8FdbshTQpx8WlOSMeOvunAAGvL9noSNT9Z3sNffDPmh6Khnpy7+lCi8R9ptFKtq2VqdaNYuEC35ZlLZGxl/V4oUUksZSFhLd6+SZ57ptd86kXxTmtZmpDMXhE9/ifVTIye5Sc3E+jSytADV6ZSsXSoGi+jLUsbx5kxbigDkxpkw8qbVtPJroAO8nTqVBXrqtFDsTBgAxwDzny+uFpgmETpnyV34rbaU509Hn7GvmQtHuY0O44y8gOW7Kb2T0MoDY4pgip+443+5czP4O25k6tkPsAYLFxl7S0Ax2HQTJLuQCnX4o3/MyKzbl7E65bHnXsHASfmUntCQ9q8xLzWrDNn+4B2kctM4qPD1PqD2Il1wQQ7ZmDF5Y0ADZDD232c1wlGasB25MbalkeEoVe3bJFHu3BJzXIAKD/qN/e3+kV6a1F+TGYPKK0AyXSsOt/fGjxhVNKue/9Dq0gKmx+cYlI/lF2QW3ByxM1dlafn1IboN8C4njZRdIc5Vrg654nWdVqtDnpfGLtvLAFPWU9f7q8VniqYPK53y+10J2uGs93FaKxHX5A1vMPrxKPfcBVXCcjiKWPTjx5DOqSKNxqQLCTDz/Vzz6aKCmN41xE6dGyP2QRt9ZN3zCb8YzQddvyYo9y0kRKEb9g2wHoOyk1sg//cHRNAq8/t9beUtlDieH2xSSBKtBxn/TAKxUwjbSOK6Ym0VXPWh6oe4XW8zsjcpN3KrMc+I/B8upan7MMTC0GEk9aOF+MWmgcUHhdUjzddoZqyw7sJAzHe6qhxALAu9GWKR/jZnmFae6mMUaJVmqYUpi6iCoB/Tgbt1j2zvW095AMk4XZb69fY7g7D06ekAZnVzJ28YmcXWlAE3MT6eyI6XmlUlN+EkiS5//GagGiLnibSvlcWMy1omilLm1dB4Cq69ziSpEDPUlZQOLeUs/Hz5oPkeNsbHS2srrmHkYQTxJM+b0ktEeAhIEDnBCAIomS6fGuob3onek5Z4PnWxTHt+2FdQZy4wE6UdUuAk4s2hsGmOJ9pNNMAKx3qvOAqpE/pcylWnZLWiZustC2FJcC/Op2N1d5yMzpC64PKj1GNnGlbVK7MX3nDdKa3ogYZH9m0qoauB+Z4PlWoBcyGpH03UCpD62ekKNhQ96YB3duAUxZbMHG4ufXj3Bp5ch2AWNkD4Izkr1DRccevbLeQDPJMG/PHuHwEN+rtcmcgGtXPh5giFuUyN4D4j5XA8b0vrFpqLguhVJtniNDcH3CyLWRTZhl1y6ic5V+xyA7FjB3OzkIM6MiNfPR6SDRwwN7TlPLi9O9zvn+weqFIbUNQpoT9mfeevx3zGsF0lmC/5uOJt3BdpeEmSzbtpgyIB1Qg4TpxptyhSG0o64hQ2p1O5ryTOYBz69Q5ghmVrTrb2YCRGcytuCc5uzuSa5FGf9qCI1XkofRbKrElZErTJzYZ5jnShCCoCf62MWyeJ36g5u94V0tgcxndITxh45iEgqebYRgzDhAyy5oEXPn23B05fbsAGD1KIR8hEilBjZmdRys0ILxSkHNfh+Kk9fMajx0nUw3ZEbjGsGFZ4oRMcTAzyvQDuoO0tQCdPiSc84BjjagLjjbWJ9ow6/XBdVsK81C3Nkm3sdtIijTvfHe5fnFywKsz0nLGgRTjwOtf4/NkUCikUkBAIIbcpMB094tzayhU6jD4rV9bN/BJZjAkVkXKEqMvN6izjz+flJjS4lF0KaWC/WooW5OvXHO9TtrU3/Yr1g7qrGAvy14MvUZcLfwjIU1QFo7VaS6832WauSmGiZtFXkupbipcNPBQtr6x142lgWGTW6nad/M7EAdIkMTA5gJDXMoi43x8UBcMXkI8c5DKS24WarnVmtiPH8nHtJ8gkzzdp0hb4d4oH9k1RJytB3P7RPhmQpFNtScm+6WI9tbGwspRcn8F/m233sikLgNJZ5xRVvHp2AN0gjszQmrWNenfdZm1Ycn/vLK6pvpnk8h48HdqCeozBQJnjmhsG0pXv1qI3eLx5A0ia4wn4JAp5+cajfnfXjlVaON09zg1shvzuGuNtham1RiZohEaUAtwHtxmHBkn+S0pK468nYKTGCu/IjFKl2pYEEjb81cQRfamvdM9DgxcyfYAHK8sDhPlr3Q1nwU4IiYN/c+f6YLYRKb7O+JoTW5C1AFrKvOGP51c06C+woxd00g+JyOAhC71yuVCleoAKBjNNhd+cWdD0PyCreUDaTugg2TwAkgnqDXjPPCyM1JFSXckPbQBJf1nLz4gB6bZp98J6dsz3brFfBgHzLYpNW8QMm5zFgof7McaLfej2RyMhYf6dc3tmxFs/QG+LEb3qbHMEj+a/+JHFQYHroiuhZVVSLIct+GqxPN9clBOdLzzTbW0T+Js6VCAAZfMH/KkTXmh2fDjN7OH/Jt74aPmjkZnoi9Y9z2/No/EoqaiFvKylFQ1kaPyzqIXvuepld4iNSXjOJLRZ+NO0cX85BjLmd9aUIcOR7nNdpgqTOHzzTLk86OUP82WqrmiFc3Sj6A7NH8lUYgUyV92q1FL6O7S0Ict//rP5NFyhq0Rgkbpx9+DdUU32ogu7oO8+zUsK/AhL64GLc1eg7HSliRWdQSo1wV24F5WSg2Cu3Cyj7bVRK2gRchHA05KtlCMK5UL+VQtSWHDfOuFRcxHcKM3Myc+ZqbyTeaZ/McFKXLsnxxI8GdivDHXT0l6TOEyFaa1AZBLu3R0pzxrR1lRh3zfBVOyZJ8ISQd9jCjbhIVYjZ/j7RWr3DqlQHgE6kpbtwrRIvi6py/NgDzty/fpp/X5XDwC5lVb7DP5f1Ws7yw4RHkk5ETrQPGbd7c7BEFSItcQNO78Si57zQ98NSIbTRnxgrTApZopbe/Cgx8EVtLwSBlpW69pbmHFrzvidXau47ZTfQNuNTM/GieaxuanKSgS37Gw88rZPtoBBuEcQ2i/Zx2/V144kpak1EIWFsyGamH0i7pakWzMeR3Guwx+NzUhsr8gn7De6Abm76o8q2IkgcKAC8Q9Ll4mt44xmeI8jIdw2RVorB1Jqrb9qXoKP+cjWch3+64bI5clFZ0/JCVeZ+PCK13/6iZXIS7r2J9tgyWU1fSy44lo8GlyBdd3sjQP3z7dXEm9dEzAWYHNMnTeWr0+d7JPy94Sga5iiMG6EVAOSyomG7l8wNwK1BXZGGoATMbCfoGDi6K29J2M/qRvnUe1jjULI0cLucVULWWYdCInbn4NbSrv8L/IEZtrpvnivIosAqCTZakG3Tn4Yhf8p9u45891yvHc+gamAGMRgzmb5TMpHqGF3sxXltgM/v+lc1EsRoZeePcBHH50Dutw2sqpwGnD6c5gs7zeTXfTqbNtEyu4KuuVkfRw9XR1JqniD8jOQ4oHVTxLvQO2b9R0GboRPXIrRy786lcnDIFx3J16XUk9KIROCHKsZw1RWSqKD1hUUup5RMPF7eP2dPjQ8wl1ODQZE1c4hDQJPPxtV1zF0ZTATnpFrg/EWBUvga+BG9lWzAq/AkVRv1NcNj62cfN6KLESq37bThE7QrCTRrj32rNqYzc9jsDqPYQWBrrgi+1KvpRU7YPhFwJI0uxy/v4Qeh7wfEOVgz9XCL34alydF+Ipa7GWtG7JnEYEfbTACSIVUC6KDU+S8/0zW2sezgq8oviFESMBp/2Gc4uIlm2JV9cYgy9/kTxAZ2K1MkIvOlRpSHRz+NocYhKck1eKt8+ZOMEUiveaG7neNeMcMk7rho5R28gOqP1ujUwD3FCsH2PvBQnhnSBgwTAXGIdQZwLrP8QBtGrMSgY7oWorQD7/gWU0OD6S1dl/Y19LC3w8VtIravbXUj6VHmxDA57AxhBLDfxjqk36o5kvklUdGXtCloSyegLWEgaj0mDuqNPT0ohpQ+nwdYBPraozga3umasuPCr2elpZdRiS+1WuvKEgqQE4Qkn2crFivzemUOUtDcSI2BguijrfVeEwbXcjTeIi99BORNb9meBYEoURxFYEBq+g86ULmquyoQRx0OZLF7cDFvM8Kp/xa5PdrZ77GaMMSEVlAZtg4q2zekgDRcprwjxymdKtrCnIjB7cCjAaBGEUcgBrRCUImEa3ebXa8hFTy4o7TTGPFKyr1IaniV40iqbP7AdUngVC4Ke8+PLLWwzNvfZXAeY9aq5CDmklBIkGDWE95RFQz2hN9f63Z/bImx5DsQ/Y05pPsMpuW75uSYmR7fBfCS2pNRQeXdhzbokQYuXmn6RPjNIbD7P15SFkUCI+SPf3kjgzdp7pZfdiGRefpCyUXyEhnW85hB2CAcCszAh8bu15YAaALigLpI73dVTyynvPEi1y2G9RSYv80ik9kNQtt/PlSTtgYXeE4zgkpqOse1cnBOVzYK8vWiz0t6hDK21QMUmkjcKH51kkfoM9iUhDjqSNIkJEtFg9BBa5u81Zfuwg5nKpEUZqeMDtVpr9t7cYvmpqLiN6KqHuiYdH9qQoUuwWuNWzSplDUmpWfrW1b1LrvUDsfMleY2ERfvf8jPWC5rJ+uCrSiaPwekWstz9T/YYh0W7U9rdKFFPKOPqJKZ/3rUuaq4Bgy5Jg7YpBQU72FIRUSPoYoPtD3pjhO/cLtjHi8pgGdCOc6eEWz2EV68/XqGDR8TeTLMxNaJG7mpd/dD8MsbKagTtAf5oGg2CSARCz/m4mWI7njmRAivlRMm55AgYV2BzslfAxAZyuVLih03McVLZMW/zwY+yNFJEOJZwxTkO6WMCd+nSyOrZuzNDHWJUfbVX5/jJn5qQbRhER4ATeu8Ugdk2qARwzkY7DS/28pA40lt22q7yGK828b5jlG4+L02HeEMZlQXu5EjlTOmXM2yGCWKFHAOR4/KBZaGvsVgPCtGa6JyTafRM9GUqRD5wIFT0UWwAJY9v55Vd4MSwRJvanUjYMLiAu3l1n3e4U75QnEjWU4r42Q+Gg/yBlFKjD99JbXobh0rixgGOROfoxsdUO1p4JGHbIBN9JRrp5MHnVk0sitzETv5t/m3QkQGgWoPrazwJ/ekLyWXef1vhdS1aeX5JrdpklAegN1esoKiJriaXBDIZE0OHaG9bREB2Z2zNuLxVPcBD5aylSmIQs9Q5yqXZro1DdkIVSrVEjBLPH+MxDZnnizOwVI1EvhizbKLiIfM8RGgntI6Ye1x3834SBlKW69yVI0F4LpFbElKGgQKGJ608OS2X7hw0WJFrvDj2OZLEbqgMsT0cEZIQmK5B7BnsYbPrBS04UgLV8iggMEfHm+05aDu5Juab5W8CBg8VsvRvm4tQ6rmRhbZCTl0XpwpQBS08U5cezkijR3lV8j2gCffKHa5rwSnmDg0qZ/l1rEj1Nin0mVs9Ljtcp5ZnCd1IAYXIfuokFOLzxesqZa0cQtRAnsN+EKz48z5Ls45X10J4fdzhDmLiXPuFXsTTG3nuWByUq/oJ/e6x9nXRpD8qQVhNXn+dguXi2d/TIRUqZT8kktttKJb1zlG0J4B/kp9KIaju/sehTTGKxQub8HclopqprxIT96wK4APACQj//cmWR6yErcRYsSWwYSb5rv98ebCDbpde8WD0frUoDgwLRuck597ZOHI0ifLQgyTSjGzX2FrZMGvE10ws95YOwv5XaciBHltmJx0ULZSbHL1oSqe0ZOD9QfXIxbudzz035QoeiWcH6g+uRi3c7n1SIDC13lv1nYvVwfoJjdA6HNsogH9xiqAN0vcX/rfWTTO9Grb5OXEzRaocv22DvZ4dNmBy9HLtl1PcT+7BayabhMI3zJuVJgAjBhLB1tucxZ37heH8ptlTaGyE5LXghQukp44SiY3V91a3Yt/9S0x8YKzU0yWZaPwjim9r520mzz8EazstdDI5tI7+smRDhP8On6Og89WeLft+4TFb301cgMv8LZy9hDcyAnROGuYUSxfdFUHOHqv4J/4/pCaUrc5IL3uxpaFDNxf3MKG52G84dbjnRTJMbuhooYx20ZOssvwBFJCQLndRI9BoTsyRQAIcJ/nx6HjKY0ygcKv9dwNgwMjJSzG30+pLTQHZ9Z9WW6dc8f7GWodh2srbqDG+EmCC+XdELdPAr7B2xEj8aGhRfT+RzxxJQemKIC5ZzQlFobW0ivkuP8xHi7kcDRKYaChlVB4j5OL7L3eq5IxDMIWFRQBLFrWJXY7QjG/E34ZxRclQTrkk6iT/lQhkCz7GoIiQNNPSo8qFhRxrK7kID9K/0iZ5PpO0yW/sDcaxOM6movmEBAIjoJmeTaj99lC7//gGT/s2JnYWZHLz0MiinIA+DT2K0NBk5H4+WO3fzOBvAAAA==";
    } else if(Dynamsoft.navInfoSync.bFirefox){
      pic = "UklGRiQ0AABXRUJQVlA4WAoAAAAQAAAASwIAUQEAQUxQSL8AAAABcFpt27J8/49kbxwqmQGYwGUKSKxBp5EYgAGcBZxEdaK7vTv8dkfEBCh3vP0SA+h7XvYpPVo7iSH0Nih6A6W1GEQPzURq+DWK/Pf11kMMo9/lVQykH8H/+B//43/8j//xP/7H//gf/+N//I//8T/+x//4H//jf/yP//E//sf/+B//43/8j//xP/7H//gf/+N//I//8T/+x//4H//jf/yP/6HnwkiyrBpJGjEjSVYzkkSUkcSrtOT4awT5ryphBQBWUDggPjMAADD/AJ0BKkwCUgE+bTSVSCQioiEkNOrggA2JZW7qv2dx6W8Pj1C4my/1Xb41T5M+2/ZJ72fQ/VV406bvm1/rdd/YPmTeUfrX/D/uv98/b76H/43/W/1X3Cf4P/I/4n8//oA/TX/of23/BfHL0Iftv/mfYB/Qv67/w/8J+//yyf7f91vcV/kP9t+uvwAf2z/H+tX/tP/r7gf95/23//9wD+Tf6X//+up+4P/m+TL+z/8L9pvgW/Zb/7fu18AH/69QD//9Zv13/x/b5/jv75+xnob5yfV/tR7JH9z5PomXzH7wfgvy9/xHvn/vvx89W/yv7x/UL/Gv5N/e/zO/wOeL+zHz//Hf4j90/8P8U/wf+W9Mfs//h/sj+wD+Xfyz/C/3T92v7N////r8RHkGeiewD/HP6z/tv7Z+Qf06/0f+5/zf5he4P9H/xn/G/zv+h/aH7Bf5V/Q/9V/cP9D/8f8h/////93Xr8/c3/2+6L+wX/zI7d02mWbFFelaJZfwE0//eRzeUREsBnsxBHWOpZL9xUPNePv19YDPZiCOsdS0kDYgwr7uHgfw8D+Hgfq6o9y/1pEURe8QM5IKXcX2VYWlo7VjOAZ44VcQSrgFtXDpkpyZtP3ye1DjzfNlUmN+tZpUgWz0dR3lldnABad21d8GtBfG0MtvJQwmoOmI5saisFBmnkMv9OLDtRR2UdGBS2Uppm9d2+cgb3wo8tAdQKVm4mnQBX/19e7khHlv45IIzIOTkD79jHut4GpYg4OIBqbug8D+HgfwhX8LayNtR8dS1NGogl6hi7E3CcDXtRxO04z1vrztEBueYPbeyzOmJAslQLqsU4XSjLtVP1SXbT1OAKgXTfTXG1AJ3QDkEgPTkFuqdLbjJiPZ7ddxuBGpORES5IjuHeObAV2QAkW9zATcAZ/yW0Kg/S2t8a4ayKLLu4jaZDNdWx8+qhDqBvGn46UNcD71G4R7pyrk/T41SCLdupX8G0nVakFWgavr84gl1IeheTbnuARHvmy1DHDsXblGd7rHs/6G5o4FKRv/Dfb60MBt4aGoWsCpOqPv6WKer7fh00bKPcfjclsjkiS9ZmlFqy8CllIDHC6ZXzkxr2O++Rp01iIuxJJUF3z/yWTI++4l8t+7JAw6eppYo4wyfudBjKatOCggxYVs+iHCGn2LwZm6IrqpQ9QWl5tP/5TStrCaZA6uL93O1GxwFWtLU6M6K7CJ09qOdAliBv62DjCIGYfMQ/MV6ZV//Rof8yw683LEfkZOLx65N3sN90qOaUmUQ3YahSk7GnTx3c+vMtrhDhHq8s5y77cOHNrh4vxjfG4qd+1ArgsUIBfXO4h2rcjBudJmeOUWC5TeHu8FAzV/tKXV1LZnyU1Fpj0xYCJ6ScS5+DzgE4DauD7y2qkrxrvRz3lKt5GDsncPE+jjd1v203OXyLspgKZpASj/TzjRFvG4TN/QvPtMfmYCZVMjoBRQqNYTsO1O64sZ1ldNprkWrAsMeqITY520AlYm2rgnkYIsjn/5AxqPvd+tVfA+NYuVC+IXHuILcMsOTElDwT6Houh5eXY0wCZVMjoSlOgDHBPKn9uAJhdTQSglFAbPbICwgmk/bjhKCxSDoSj8y8NUnvi7tEPXHyNOzGfh0PYQ+6K6SfwNn4L06axT3CUHMs/vab86qQXe8QQ2ImcAiPYXf5k/qwKFoBPyhozoY85szkjVhD41ENhShklvgWzKvdXlidBbSOggZKDjR2aMSPNaqB84pJzNWJOTmvE4VyJ5+OHGmXnfyyuQfJZnzsRJYhHIsnIOhbs0fyIvSQyn/Rz6vgOt3CIYGX+lg2TPfTb9//1UcGtqWrtYUxCRd6VSFuBlUyLabMe/GyiM4Qy0rea7B+mC4ZcRbL8KSS7HurOvyIXmuvXzmf8Bx6QgI6iSVH9fo0DD2DLTwWiDs42iy8VYFKMg8kK074YnrCs/AdpCXIF7XreO5mITdFXq4veD+GXYGTrkOSG9h9KAwZKHcCyKSh/XUehE6EOkwhYGDJQcy0DYyzJxBzLA/luKm4Byzrv9wkI652IcDuwVlRuWf9MhCB2Hg+WznYgQhMo/pMzTylb3/hdapfJRCzWfBxyYm2yZQULj/UaQyBcvSDER8lUBqvvp/i/QMHt0Mue4molEwVekKawrPeVR6f0l5KDpusbThYg42dGI5MvM4TKpipWO9iBwAvp1BSU4qr5qB7w9XnDIs78k8flK1fqKxa+AqdKnDI0tEaUsvib8t1Kqa5p4cI5dF6RIAUWejzyMVxMPA+mVi6NjVRfc+GWvIaWT6pgfHFKIDJMnKgaRZMsgZ/w26St+HSjQwNYh2ctymzYIvxmLesQjhHUWBDK3HmWgVeKRxnUe0wMu317Pb3JBR+wK0fZTZ4b/YiKb6Rps0e25c6cibOpv/woOT/H6cfWMTJjkzyi32wrX+FrRrtRtPTU0Boa9QH/4TcaAF5bPfbahlObRPexDmGKFpbQti4TL2IvtvOjYG/7h2FoON4Sg5QBzdJDxxfkZjirEqRjXQYR0AMlBzLQNjhKC8zATKpigwt2ycLGjsWCZxPzgZxG43BkI6hzRT8ow87RzxDq9Yl9lBzLQNjhKDmWgaydbKIE5kgTZQjAWpOy+ZIEyqZHQAyUHMeVAy4C0yQJlUyOgBkoOZaBscJQcy0Cm0uLm/CUdC8o0eHOX/HO05eUaPDnL/jnacp9zWEpc0RQLXjvn3NW0JUDgXAAA/u5Mzg+ZKRxfd7mqhbGfcFOeMixjir4r4Jm3TIXBUmB+Lt8lr+nzrthObKNWqdaJGTHHuU/GzWpwe8her4JquxR4OgpHusNeAAAALUA7QMCT5o9XaLjjaJJrhQHMSzAJPheZaW97R1VqcQ2TbGAxdTQMX/ahza0Rmd/8j2fwPKB8pZ8/Wcfehewc9hLaZq6JFbsVh4sFDO+4HNPVitgh39LIJj5l++weEB+CfgmkrZU9EQIRboIuyoHzGt+ptTE8CkzqSoKpzuhtVuQu3SxUvzPP+oX1LXk3orLal2v4kwbYrT0Fza1MwS+sRZbRXxjStMsqw4XHrZqGJ+pTF1rq68W0bubPcSB1YLlpX8HmH5i/5+Gsyg0xwzPJq74/it/9bIwpHf9Ke7PBlI3SjO8HVQvSdqKEXzv6IkXxoPsNsIkvGoqZ+fuc1qgf5XqI2KxOGJJqnLwSx+lSkkP78coq133KWY4luCNYNCbE7cp8mV4u4OnaV5nzbemUd4h4RoDw8hIakv6g+BEuEic8Sy7w14Hc6MA91jAIC5gmOwFrdj5Kewn4jSow86EUtcpO8e5t6GWvdXKs2N3IhfoY1IeMpWhXSbjacPKmbSK07JkLaqvn2blol490iSU1WGSSc1eRuJw5r8WcSqac04VRaWZzxnonKZ+WR332mSgA7G7/lXSRSUwLuWwbCm7iiiOcNHF+683LqDF/9pnJoURPSGtB7+zFGzoaTWEIJB2mBmog60oj3c9K9vG41DXd1v2tXzsb6CJphXms2l9vlSmdJUE1kSq3tpNx1xGf9eTSf7SW2MgtsnF5080WcKDARvZ/0/ct4MDq8MUmBO3DlkgRATxysTCt9a1XldwhyTzmE5+VyQQAtvmPtp4tmz58DZklHTbuMqbiIXQWanbZ3f0ffSbptWhGUhPkNslex8jae/aPSoKkyr5GaLimGHbOnw45JYOcLoAjtbKYTt+LPRpM5h3cYV8+7WJDBlUmJEFIRHxYgeU5+rFuLua9QaUD+wVyLh37Lx6HPSsNiusUJrroaeFc7osvpgfiyjE5cozi/Wh55dEmb96Ne+UqF2PBBbNTEhbuIv2PY/T5lQ5ZT2cp4GKix+49UCWVjZNzhVEBSWWFRvHnl4bYM8fsy9os263iPTBzQEbY2yfbui4HTh0uezzripn9Q/laMfnZk53A7/iZp8eyb1nCxXvhDDwkTua3Gjk1wkWTdHMaIG/lMCQpOJ6Nakkk/KxzaYMImQ4DJXuJNbNCf9nh37E+U814P+uZpnvMDMe5CNW7qRCxv8qwHWxZFq56+QehlJX2CtNGFrvSQeTp+i2Gm+PJelaPxFN4EGNbgmKV4Va6lexmaAdEd/Z0BPPszUUZATOC5dF5vuNx2SX92p1VyENuTCEPb3PxUwx7vA0Cng2BRyOuZi2wVcZrAId6WTqOuMW9BMB5W6yh4Q5pICXiYUYY+lq6IiK5798nD6oaENH+JtsWp3XKksvqncMDMMSHioTg/y8u1gcUs5tn+HzodMN6OpdejPHi6lZQc/7KrgJhKCxqJrErFC/kthF+WXkDTV5OSU5DPW78WM+xGLyjDYpnJxcJiW0oSqPAMrUgwR7CoQBIPFG3P3jU2YIpM0KvMOXw7A6qmKKaka7m/y9fvWig0i+FpWwPzyVNi4yZxS/F5k/sXOug9CsFdNUAQurvJCK3nKHUhz1rrBK9NFXLONjgcsGDAn4/75zuC00D/rg/HAKynCJtSJj/r/979a08IPMCiJbd7VIdk913lrgzYXD/4/IUGh6l2Gqg83bNzrM+jnvxNn68unk8zN7fMuv02u5bzFedVWOue46w0csPzILvNg6Hzg2VhxqmhZx9ItMUv2ib2HhImQ3fuDdMk3sJzuiKLmE6nLM7OVE1iI2WuzDDuqvUKNBza5ISoNCcB+K7KaZV254kDuqwkxDdtlzL5RyZLC2LTmwMEqCeq0URO1ipoWggtp5GITx9urkRGYo9G/NEH0RAlj7STIadj0LzN5hAOSCcQC7WC1lbangDOMp8s4qG+HXlhfhWN6OJOTbjctl6kaNXxqXG+N13T9h5Qn0e5zuC32NLrc0lMsURSJqxqhXwvfzLxVSSAAAw+YIN/VJUSXGd+ahK4eRgDnU3sI1XGUo/Jp/XwFugTrbJLM8bg6kJaA8LvuULekoYG92xOLG/EHvJlTgpvm1fve/7rOZdBtTsSz16En/RSSypzwZBtQNxNaImpzMUJaA2Uc1fWcKr2ZmXzUADpg8loIIgxjcMGeZtfVL4WbXLd11UPMAh8wyFzbFRmPQuODV5ag3CGr/kcR6KTsDLADCYKRJ5SNMJ57baWaNmMCyUz864tg7dqsC63eHRVz4MMwCtAGFVmXF8ceEU2tZPf8zIdIdFL1HKJBQlOQJfgyFfcJnOQZWMKpPkbDy+99r7JN5LqR2MXVvkrPNYjcs2/AgcbExoX2g0aglHl/JjM3MiKaIBGxtl5HwY0rDU6H7pj8CtEheO5FpU9eQPMVX6YGf8X4l/uQwlI5figMlUVrzDHmSeW/w68f0ZUilNCgpPUU8CJclWyxBPV3wWD7VZ7Obu1xps9YaqYtCKfd+GGeRhCjtMKelF1gGfX+r5WDSIZ5yxDPTS+hGhkvec7c8IK8sjzegZDTs8kTklCAWXeIhunc8CR9AsMB8dT2Ep+SqbQmLl81LeN90LVdVkvoIBeldh2csQHxGnGYijENsuEEjIuQ6U04p6teZS652zxbNXksfe939hp+Rd4YIw7ePoz5SnRG/6CZ9MOalfw1y1dO4Gf3y1eipgHztcXlMFTgMMP0eFACnwMErxNaa9IBx/XIMA9Xl1a97chEhWncYDp8o4L8ZJQ1bNJQm9luW18u7A5lhlUzxneO4WUgOBSVzl+xQbiYwGvIdjoU6KiER6CkQkiBkQR6faH9+OXdGQn6vHYxL3aDrhO9vmIkJxxVR5kxL9mT4uWU/THKzbhdNQstGVBGw8VBbN1L2y2zz8Uhb/FFKEy+C+YSqDT1x08jHZMHIBkfnMIdqN5XiOvMN1l+xV9pZk78+ivxcai16JLpBGH//zQvpFYMWMRMrPt6XDg0+LQfWBFacKT4RBByRbP9DZvMvRZ1675t77PHahUeSe0WApLUwCQzd7Z8QvsIeqdxojdGnDP+C3bi1UKfJYbFuVc8QHiVWqiL5R1f6x9kv52zX3A1MyNesEwyo8wX+1GvvyU6/0OonjtKfJRDjEbVHSlVAq14S1ROdTIhiVupTTejx9gCGYju1fNNKtyw1eL7GEqHjgm/nsgz/aSU9L9/k0CPK9q+fnZMLhk7Qj5jR+4MU7qmeMtpTSowtazt+9sjisBlae/gL2hGIj4kTglriP0XwC+q90QohaEHqIq4G1qTdhHmAhRls6RU3f4ct3itovx42jjjNExjMAdyvfCoeuqyMEtvwxXyMTsh/nMI15Ohs74OAbApc//M7jhKf8qlno7tUPw2S/Z1/4O5lApSNbX3ayoXMCbwHOPvHASEzsn+b/e/Pz/0ytePZslA5viL8muMKYa7niXJE9rmuq2adMRBJh+U55MgkVV3msN7sd3VgTLUGeo1uIayQX0xnLwqJLAa8GUvq9mBbDwpYYeuear/6bDBvfq+x2fGFjiN/ZNU6awim79xPvYTT+PH/T+7+8r5Um6SipKjeX10pRPocdyKkzhUrJAh/YR3/HG9q4iC6qfapAaw5Z55DRxrATK8G/9yaqWdSBGsAJ7VdreYE9VkAmPj+6CUiNN4MxrC/DBaub5C5oUgw+7eqWA28vmzr1mFzMGW8sFPmZEQ9x1fqqs5v3csF2DOSirPnrk9HBrLfzlRZ1qp3l4YaeWk3bCs0OCJmCodOlGHXQVuM/68U1xKnLuh4c5LDn4/JYAyrANLhh/Yg0fY98+i08gZSpeui+54rmn0/EZnOr2WIib7fmnf6mCCPT3HzYMwd08fIxa8zS8TzR3aWMIqP2Ktwa6p6pe/SIxOa8sRPITGo7OSLdvQBKLiI9Dn+kPxBFJePOI84uF0mqcZVa8CBgMqqCuWGK+K/74iqVokAMuikeu5Wpi8jiQTtiMVgUw3AQ/KZEPL8k5daeuLL/3lTciteZUjfdAIpBrN+qjlTKN4Xk+Q/bs4M+mhyx/Ra5Slpnlf6PxtHHgTwnMe5b88Jt+Pa7IBYJGiKBYc8uWqFDfnIZpDI2AcZiPnKwFUXUViII5kFpBom5Fgc5WnwP8f/rGsgNwh76m/wI4BaE5y+dL7a33BzYmpNxI9MagNcdLuyW9O6XvpIEpqnQnD1rMVLXSMA2nmHFpUFtbYhpBJsqddiRlQJw5gipiNYHujBIGY82nnCSnRMir0SgqFoV38dzYkZd93RHgFzEXOH7wA9e36VbSUlxOg6TGAClWvmTgnBeaoEzK/7DAyYCqaExcxgubiMNCszWQ3Jh3e9tbaaoEzfkXn1z+dGyLiamU1Jm4tFoYN43Mfc4bOMVTO2GlAAoXtTAkvADGwfaEj1dYSNwsLRtfinuZG53+fa2LD/b2AgZ+nyEZdzF2aZlenFkKhR8Xw5ngl8ytCCI3X+NLF9vD+D8cwuEglp6elYkchvCOm8Mc5Q566oxPGMwf3G/E8TunJ/n9bgAP9Wr1hgHn8XasWdvSneK7WBxOcYh741jivU+IAjkApxTs/rKPFJX5WD2j8VSkfaTTVen9RC2R+gxo6dshN0KwKK/KQATKpwboFFvX4AlZdK+lCLiOAIR/DhJTpV9lQv3DWCTjpHxMpvRm4FtdP95bM8ntSF8bt+X3/CliZa6uf1aLvi3BfCod8YdTIw31+kb9Al1IxK9zVuevGiUL9PlorjkDUjWgiEMRmJDaaKScaM/NCz5jGuwTnWkQxLTIr9dRk4euZ7jHocuIpvLTYOMJ2ouOI3xTnbTijucgUROm1XYPswGkYSZWnpnqVwa9bXdegYhDWWVQ/7ymWgCp4keCWYZsy7i5SlW1+sTxHjvcEfqR13IK9Bs9Z+ip6LM+yY16gxylFcLPQXLVc0JDEll60sgj+Gfca+pDpfw3/MR8JWgyMO1Tmf9lX6FTKFn/SnFY+Wp6i/28HY4moLSvyClsOvWhrkFECP3rJV1Jg50ZN7z5nEZ7aYSAwnEMcae01FOZRjZ0swUU6lC56LVI7F01IUItVgAjqSofT74jAEF+IC0BeUHYygW1sG74IaRwEwtBvleTNhyBUoH+L9tWLHX7EfAX5dWJPDYha26bJTazozKvZmhIQEgNNRHASZtRucd0NMh/Gc8HyNw/AoEEywvfYJNzlHkJ6BslAZ80L+PCUUkRnJmMsjBaUDhD28grObWDdQf1SoH0sp28V/s6wFiYzhH4+KAaMRC3w30lQlSijSbHd0EKPDfid8qntVj0kdgrWWuDOLYqyvNVwoGmhRQrQo/VikCOEDblCHnZAfKtPzlsiUjdG4DXUxM6npoHrK9E7hy4Uej3omTLMnJFZxtlelbPqoqHOveVe+szw0NKBM9AlHtIArlM5JF1TKi5VpkBz0zOgXpjjqk1w6CqMymDNNhn9CgscniOV07EqoLECmP5eu1MdTRDcncUDia37vrIXX4AGgM+/JNOUjl0mi5RulCMUsuL0FmP3gomnOXpTuE2AJapsZcpACjJtSCsn/qo8SiipWS5eRK/4FUIWJI4OeuH8VRrvj1f0rvhHJWNiHx7AHYy9bQb8q70d8DNJe3aAWRHbs5Oqfv3J9BlsCk1eMAKWzAUI/CkQcSOBfPhe1Nf3k+Z5f4XmJr+fbBU1ejQV10wz/Zix9ISlDrYlrj6fg2V8QwvAB/xTH7ecGyq540YJYlcQ8t8Zc7R91JI0ZnptEiCgghYGLIGaGHi+PCdbYFaKHseG1XSuXyPHhj+qVqPqqJQ6S+B2BHeRU7433POPC6XiKm89nL+z9qEADgtAuvchoSlGJ3pq132r5KeaiuYLw6lduEl8tjMKc+r0lhAs5VpkiCqjEAGTDkrKsQKARCsvII1C5UP9pTwU+JqudGD7nVbbcCAil20Q+QQrhmIJR4KK95LGl0cHwTLLSyL/++ZTfi78T+TK9/X1ZEJGDly/+NiiXXJxZKr9J6wOfrMZAjh+48NMnwaM9aZjUuNweITc+/j1j/SVWpcLwCmzzSoyp+VCerlPn5FQO4m04gXMt+C46dvKWBkSBuBhfEXI/ZfI/KRPmFphVEBGnM//7DoATqBQ4Q4Skr1+u/UPDnMoKNRbojlHBIaFk2jkeXPwRyNMfPVG45DkeLqB3JJS9h5E8QihX4Hr765cZk6PWuXDvU9uiJKQBdvIBlkKW5njS2O9yosTL//ltwa/B1/Q6hVtI/h9RJbgRgMHhYkHbvmMsK0lqfvCgC7FDhfuoob/594BLW/kAlTkw4hKjI6ViMLTQ6cz804PFrN87cXwuGNuR13rgUm8ZW4GZZQ9u769Uk7LwN0YFXi2++t0nOl7Lfw3+02uLK3knmcgtCIZWUzp9ya4E1LtCxV01qWsugIau9Fmq3EoN6cQeheDfFX/wf39EveDcAPa1AvqPiSgFFxcex0/dtG/DIsYj1qy44CTIwE07xsj6cxU15wvhqeW8kuf1ObrCUurWred4bPUMDT5rmCGESqNWIhJlbDOWRSlaHS78LSUNHcaG3hx+yxFW5AbCYIRA7CxaipEr3JXHDSSCtWxXYHYOtxKKo6IIJwy8itMfeLiNjUsTX7SfTqHXZKpSiBEKrKkLe+lGzHLZ0IfMvEfsFdX68+QZ63+ajTWl/WUHd4hgbKl8704Uw49FBXvVyDOcdLqontzVPrcdY3sgJhcR2AecwYRn15asNTUbFlGIs45/pxbqkVOSVFhEMU0TQiMGig/6Wr7SEHOIEEqRCVZDTalB+/XInLJEi31ACvV290FF4ymG1vprZDJ01SolrPIzo7VRjeDIPKg4mIfSxOC1b7V1eX1IFrOvnPq8wWshpFeatk6pRtJB2omXI7G63EFwTIJ2QUxoa/cIW5wuElE8eaqZEhZePuSGSAkf7Jzp3IjBFaofBEfcIoflGKA9Blvp3o9LBOLQSGwBp6/qdVjlNuiuCTNGkk4a/ETdi8VCG/LnZvLt9dM7/b1z3n/JujvpbC/cZNVNx4zg0XfJrAzu+bHTuiGrPkMmGuKr+uMiGqggcwOmjTxa42f2+jLHjsRdeI31i3aksbKfDoQYmSLoIBZ8rdVQEmM3Y196orjk4CxgPQW3EsqhA+/BfYQLGpATTQlQ8gfeuzHkPkjFaoNKALiRZEvA7REHUWT4J2aVuLNHaQJOp4t+bVTG8aVYClgBjLfeoD/tj/D9tRLMzZ+P91X55l3wuNO/VBTAam1ZvpgrSrGuNwD9dYfzZROzFiC2moEzz5qvGb29xetTiiNj+O5trf06OlPzGmPSkypZX4Vh6rOc+/hzZkMQRabCSQkKdClXTZeDKyiIuxHCNHzit9x9WbOa6iUXa39mPMcXEyV6k883IFreHNEwC3CNu2hk8zHUDLA1LRHamp4HAQCWVlj19dy+QV/Ub80W2qcsZAvhO339qoJZF02H9nfRg85TLYf3z96UgztW+jPZqiM2Zuxr9b9+P0qWj/Lg//1tomVN/B+gSfEmXQgVQ33AkoPFvUR8hJQ3V4QWiIIkLsO5nEaNrWmSyRtGldXnOGKrTgh9VZnhXOKeMLjYm80cPbkzQDowgYdxH6YdPPOPb0xbN0hTBwU4eLrSRwMG7Ii/DuIMgjmz+v1FUbPajZZNkatgAsYrqik94jfkcImJn/AxQUy0bogLnIJ8yNbAaEcV+xgwtKTzX1MFXbXWnc+uF3XLb4iopvUb21dRcBH8KJ+yodEZbZTPLi2JRyBOFosGxmy8lryMuzvV9D1CezrckAFGLONZBKjzYa7q350h9FYTD44N38vTLvm4fV2vzH4wmJCmNembf15fPbioZryl4+zZqiqM1zDiEm6Ql7xVH4FXH/9XkoMqXku1aFR3V/dhRCowOYA22dl4ca9A80n/X7/gdSDvJGZyDKB2w5xpROzMzExYvPfAE4qdFM7rjGtaKrOsU6uhaeFfzCSPQ7J7RzRMOQy5Ww3j+gyfzIzpke/E2m2f9qUWnQnngZ+7Wr9ve4+nw+XggPPBhTIWuwcvkLBUhia5Lsmf4iEJZczM403AF9lUZfCkLb7YQFJdlwa6plNfwaoATzTWY6OpcO1h7UYNPL0N28dwTK+o3Xefhq8pb7YykuWzmDgY6oU8IVE0hqDMBDRQJzJT366MRUnaSt31o3uCWsfvhHNPin9X7fp8CNdSfjNTzoDyO9U0nambsa/TAqPRtzJQbbwHNNRF0RtudI0Njif/TP/g8AGVClFMJNecZFHX8dJd7M0T/m/cSOQO1lfVHbCqqeEjbDCd+NJcxbOKqaIX+L7Iv2AfFJG0vcZEfwpF9tz4vb7vEByvKaZtnhnnymyqi7MpLu6k7Yc48xqHgKetkDUAZS+DTD1q0SKpl5/cA6fagnDy9ZVnz8VG58w2GNZOgLgEE8qQ8J2G9ohaUhxCz+9FV9ae77sTGnGx0RWiBloJbCM1Bqj6Sk62D53tEskNzrcp47tDioL/+gOhj0sfWLjnA9u01NnLPdIJqeOYPd9cbjXIJZjNxvZfIgbp69dGdfPS15TN3a08imilBp8EOzpkhxcbfGaIs1gcVPFOdsRcvG+aaABFFq1to9UR+sYhoeg77GCyGVc+2vKMfUYr2PSsdAi7hgLb/M00b81dkY1Ot+Z6Uby/Y4f8OKMJ5vtnCjSE192O763jDhPAiKoZ8L5UJgwkX2oMGlPtQciYoiJt1njfVVSYnvB0lKFrnLnqHDQRRp483zkJWjKqsXvsl0qBmqAdo40c+kcHlf1afTMZoGGNC1Egd2jamplQkQ2YCCxjAgttbUPtrAZgAABRJfmn+yWtfpJBUPwfoMwPGsuD8Aezy830lL2JHD0Qrt2pgYfdKPzXpib4VsrqPSaPhnaDoyJZATjrbe7FbbqRPz+2qCDsTlAAAAAAAAAAF0O/FM5kbPoq7hS+bq5wj4p3owYbd7CGbbz7y0ZBzxwVanAS4HoCBdnvSCitj87FFu/tJPCuJ95Rx52Z0t2nIMnqpFw2J7spwbt1iuGa72okQb6bOOxPl5E2mlHKHMAsULypRQO7DZ11jAem05HX4boc1arJXQ9OjlMHjIbNMFsQftbt9Pxf+yiVRhZP9MS1FAPamZX4Ko+2dmk1D1EI0zOqpIWm8J4PIUhXcgEPeSNKn/FvcRvGIMoAOYcDKYyam4RiXr+PZjdQZdrl5sF29UxB5MqsTNshx0EsGeSBXT2gx5FFntsY0pTIjxGiu+OQXhqm16CBBh8/SaSp55GXbN/V0L9MneAYMTRfjnvB4jaYlv/UQEuM/koJJVdFQcY8/xiE5hy6/6qMD4nKhZSk6/m+yiMCTA1z/p4mPwOslu/A3a+Fwq2MoU7bPpn0ktN4QIDaV59OLb3MIV1xUUKBVTEKKjziAlHOc2lZ4XcosNaYWrE3Z/9uVbE1ANMjosZN6y6C9E/u+Uf25a9zGJ4mICGYQhhh9ZMaP/UyKj3Ei3DpsCH6HNWt9EmgrtkNykGi7Ac0XVQFYmQAzEtjXcCPC/bG6htYnsm3ik0QgUell4CIb5JXFk+daWA0mbka65PXacAElBJkH56n4IfYG/s24ih1zjB1NwPNH51+4V2YcMZa84GutGGSAyjnFz4GRZXuydvZD1SarVeqRg+EIYYePQL3h72IdlT5yp0IYfn/PfNS0zKuk4zi8dLVjGqk3F1eiOQCZG54VEceqvHszscdUlpKMdXhpiVzBf/wruf8AoSnKZjZVPe20ZMPSxKvbnxr5Xg1tgAE1NaPN0zw8PVzecU3z0ExpkYb6+rkIuhDNkiUpyZ2zvEFZNDIZDdfJtJKZoP23WGLgoy6k7Rez0sU9yBza46271thwyPybaXqXx/DK09Bb+RtPp1WmJlWpqAEhw4HTM+Xorh+NYny3QGz09HlzSR6D/Kju5qa7uYi2dmxcNPO2P7EizLUiAhutCiyhm8ep1mvcloZ/+SZkx5XkmxxnyWgyyQx5LzJ5BAnTHZ6CjkNzRFhs/vn8woisOJilE0yJqOeO+5LfarVfsdB0Hu6Y9IaMrxxHs5XGaNeMhZKezTzmrso3POkGtoBMajX//t8UdkJcad1FtOT6QHlsUMeWu6F2tVObv1GtNjojfM72wZv9DCA08Bd0glDrbOyDbJEo3nfyuBgF10erGnTsm6sIIGc64sFbXV5C4Ib/YHp3XgYxKe6DBltod4D2VvTod/pB4AqfgEoCNjXkibTqmxtL3X3cOGbVQIOCpkn5QzlopmwOfyCVx1kgQybLqC5o00ySnDldpbgDTaqy8W8SSigXlaNlC9yEXCr8A57TH/c8hf4lmR+ZaPKsM0XqmKY8SUOLmX/uxqcRqvLlhldU6MA/AIzEG9p5fcona5MEiH7sIDH/GF/5h8pdR1IopuGWXQbkCI6jIdCsPPSHghCCKBMTlI5NuzQeidnbj1L3fAhjITR9CfTQKz/B+Sj2Df7J15rdbwsDdMM93GLWMfgvp4fpUmxwoZn5pw713cQEJq/txf57MA9hh5KzKXaLz5dcHKfOxodk1S05bV3dbyR1VY8v3SOj4dlQVhgebCYpCIS2ztEC2S/vz0i2CquyiKc6XjZH3gQOKpvlpo1IFDWunktWMKw+uFct1C18iXWmJAc40/mjXfl5kvL5Ejo88My1obTdxRWqIPD6tknwc+0sEJoPKyvLHbDVesyTq13+SrAYMZ7My5+PFa2fcciMuYmjauSK/PjaEUBtr1FbBdrya4/9Ya/b7xD+FOCQSi/rbDhq3s7TUx/7lKPl4VyQwgweo/6npkvn7KDCf06Iks0LovroGgOc6yZVVrgARq1vLJWwMayp86XbMDpHOT/syTBgxL1xK3v8X0DGpDq+ThqIxeCYxZZsr6ga3qsFhQsCWVHa8ZQZPoB529LYp4mEiv4haYz8Jh3lQzTgzuH8dJgOs8Vv50I4LQsL8sGmhF/cU9qeoSAt+6/x1Whh9HO352LBINbK7ODp/PETVNxSKNB8iL5pWHFS8UhBBxAJ4kYqBQZWykuxRPb7kxkfg4TUDioCD3Ydc4PoMB5Vx+w5jAnpNFag8b8nEgWH+mupE0MHM181Jrlr3XDexeYlFQKnDJaELEy3Hpd6LnwNP5O5f2DtoNiuHo32jgrW1L4w2mE2RRmdvYQ2v6qQ/im/0IjrY59R3Kqayk87urJvkjchF7sRbYU3k5huFQJlREicAX1WAI227PfGx/8mfOW3zO/SHJS6BaCjavrC7bUPe6awkFU2yR2v1vYA7un3JiqLJvcoVi+IFyctBbn7JeA1jKigH7StSkHnWRSgC+7xtwgusx1VGBcnTZzpt+NvqhRm5DBQkCmj/4aA9kIsWIua9HEGsM30liqskihxmJyNQswRotUIVFuQCoMe0UuIjtfx2LsjszFeP6GF0eJvxSuUx1klDA8NW/kSYiHnRx8njX035KlazvZhNGzVPbDLgXuxfckKmKOg/b5jGiV82vvJCuuEhgWox02+BXmpBnb7ZRN6vUaltoIry19nzxM3YQblfCK1lRwALeQuw2B3ktZZ/YwjZMTdxgyS4LKixvAGQRUzAw8eZjhEDGQky844WzTpzGjQC5jGgsRvepJWn8y5l4GSN4u9SsH4P2vF0Weh6UDvOzHshisy5dNeDMhiQO7NRwvKlota7H2JHdqO1uMdf+Lo55Y4QAQvbBtMLQ3MJtAKCuP4YjXFHQvOChuUtCNoI1Yqx26k2mdknJI8y8uFG4mZnWh9MhWPVSl1pktU8D3csAhJyOZtSwUCWlIWpGWiXRVf38zh6oOvKpx/4omeFAX/V/NAZyk3M9w55j7WEg7ByzKQlM7lXg5Zf7xV3jGQq6cDwJQoS8lzDw7vQhIh4kuegyc1fxfa0Aa7M8y1LrG91DKH0heG5mKe3rahgLK2IrdpYVVQCgtvuQtdVhvxNUGoYxtfYoaBRn2gM/FAdkoz9n67jJxK9h/C7Qb/uRP8rEIE4T43qWVLrs13iVFNaAJZknGg5yzo2Hyrb2RfWebFm/GCQLjgxacyfByUlYfreMnxcrEEBFYPPqIzBHbVV5eW/2uEa9Q9au8Y/8A9Xjvo2SZc/9k+OEX7hQ2i25yK9NribAwIKXhdk9YHYCXpzD5dvlA/3XlwjlT3xSIYmtoTpsI7Vh/7UwoVfV4u+YrP5w/ZiCTgiwRS+UbSXGOzMVS8fs5WYjQL52zvA06l6cCPLkTg3cupC3zfiLiwgFYUeTz/j8JKbYxlEu8uwUKhuFzog4TCz/vGlLf5COTyyhTASlnLQ3g1uJaunZlfv7lM+6xXacAYiKbxKhhJgtWtSazeLSaNbyiwcf5Y8cDqwbmIPmZHvZ03LWvRcS8F5uXiwmaWzN/0wWg39PLHJYeHb3a1fX5NCMxVe7IDfY4YWSafEBBdAth4raLCKSbZ3QxjoFWXCl1EXXnt3DzIY88m1p8rmh3dWhQsLepyk5OT5o1gKpn7Qh+jxq2Hef5X0l5Ued2Vu6/J07IICPve7BRjnGvMDVCYi7gIHdUXaB1CwVawcLxXI4qNgo7OQLETxz9lc57q8dxP6q52/hM1faMKhj9GXHLbO+rVQMMEylDvXi3BOUJaKhzjAeRvchEmyTNrAFj+Ag90EXatiGnxn51qHNsedSIjUZvoxpVjfJcTd8XKpAZT4/L6fJSx3kvsnIABkCNFLCW2V6cTPmV+TfjUZyn9EIQtLjldG81rfl2by0037uknQUHt1GRcGLVy5+qimkGXouWvkM2SIGE59IHxnrkkKDyty8evp1hjDwWIrFB4WgrOWUHAnYZtiJjpR8qsVm7Iu6g0qpaePE3KwNM8RgNeBOUr0rXJCfbPLSuh7/MDBsX+lmrR/1MVYiUr69thOZhnyc/bR2XWbLCJWTUpa+PIo1nY3zyp7wfKVvfYclM4fZjAKlFwP0d56qicxDNOTTWnLIt/So02CWI0GmJ25JoCpWR1NI3373gJJCPIeT9N4zqvReyxSLsq8YbVO+GFGqVsyph6qlEFkgHmXguZhwAWJ3BD2XQBT3BjW44qE6E0OFAaeZ4dchB64OjvLFB507Oo+H//KW1zmj/gwPmpymZrUSk+gPbAE2ABhhZKBNHj4lCEVpWPuYWAWP1PmWW/mTVuDXq/6sD4ILhPxVdeEIg6laodylb3R/waDTjS2iBXZxAV4kaBjDyEwYBEPkXzP5i4aCIvHY+AFTDzT/hpGzbBJNKo6jXLywskgsYEo2GMe7TJDJA/o/lFs+GRxzk5PJN1R6kSNOyB6HKhzcBA2TmvHRopOFIHin9nJUpn6jBmDevLtANCal+i2PnHxV0kQc7udKCLiTUREfHuoDs8rYuW5ZBT19Lxvjbe88lyHv0/x7D7sT+O1RVNm0dYsJvBhyRKhi0Hj/ZloOSAAAAAAARqMcBC1EAAAAHy4WGURWsLnWHTCeqQzaRmvCYoaEs5e06X8UduoZ6MZCBIUAn5J65KmrkN9xOtQDtKC991Iy1bu3xrbHc+DRMSunVTyp9zU3NvMqBifn9rdFXBBSjr/Wxrt6jAkfb1ajaXL4+soEK2bWpgwGoCbUoQOTVgfkaXr3Abk69iv0EziIrmi2Ua6w1xvqZJ1Ui9u5KX4C/91hJ1jP6xw6aAbJXP+aJI0l3qPwZ7PuxZVGiMRyHbT7pGNz3Jq8ub06q4JcILck7eqQcfbkqdv38rWNPdLv8dU8rGBmGHlQA3uWtbh+Et2F3Iw3Y1JYzO8H0NJLT/QpNEPkm8VrD7yaOozq/nf3TSRpLCC2YSjnvPnp5Ij3iwPf6YYsar1GBPDTqBNA8kqlK14rNIvlK+7kCBuJoPJU12AGVhTi0gfQEKO1KdUZ4SLstQ3XVWft3IsxAzkTb02D8p6/FYwIsoSqZWBW3kfe6Um19oBTBYAydwRjj3k+lOhPgLacvtfB/Rp7KPMX5dCHRkWX0AYkd4AxNw4PlBXvoHUJ9Wg3OnNZMdltNqAYOHcuBVured+oKbs7CUIL+e/Uk9tBboWobWdL8VVs4uCjLqkLbd9rgyBk510In5O85Y4YYXY4IY43gfx76QS5djp3ZavrcJFqohWyHCGEnV8o8AtIytlEUsT3rDYnaigvUFbJlgxbnueWoI04P5wn+6n0M4WFXhsWM09xFHbsqplcdWZW5akCEdQHwW2MpgFfWlVXYu7Ywo2AlF++TZ+tY6oo7YAJ4sM5TnIYSB92jE+RDxTXclHE3j4pn7AhGr9ymoip5dMPtQOSkB524vIlOVPUFuJ3AM4Cg+E3t5Svp/hH2AjIJUGAiQN5tmykgEPEB4phPNTQTPkcqev6ihG16owCVQMLgasFEony6U+aEWi7g7YYyz8QO5V30F+2ppwCpCUhMsOc8nJBo97tvIm9WFCM6DRAnZ/pZg8J5fHGauachLlowGsqZJm+s5HSPoCNOAjCwtbAQhjAGsY8OxZQ/pdX35gtdru4opwA5GHUNdbTcGV+pheuRGADH1Py/RpPx307BH+fFGLDV3G5I3cGvACPvgW1V6w3Sq/iRHMJEP2VvQrcgXwUpkclgDltDuNhhTpp09jI1SFKymMsq5B5AAAAAABcxw+F3u7XUABHhK5ZBp8FAA3BxqSvqalxSYyDVTzOXCxIbgh9LG2jrKUYPMhMzRxmg+nMx/Ghy95Oo4YQtqd8nxAAAA";
    }
		var ObjString = [
		  '<div style="color:#323234;font-size:20px">', msg, '</div>',
      '<div style="color:#606060;font-size:14px;padding:10px 0;">To resolve this issue, please follow the steps outlined below:</div>',
      '<div><img src="data:image/webp;base64,', pic,'" /></div>',
      '<div style="color:#606060;font-size:14px;padding:10px 0;">For more detailed information, please refer to <a target="_blank" href="https://www.dynamsoft.com/web-twain/docs/faq/chromium-142-local-network-access-issue.html">this article</a>.</div>',
		].join('');

    var existDialog = document.querySelector('.ds-dwt-ui-dlg-wrap');
    if(existDialog && bReturnToInstallDialog) {
      var oldDialogContent = existDialog.firstChild,
          newDialogWrapper = [
        '<div class="dynamsoft-dialog"><div class="dynamsoft-dwt-ltsdlg-header"><span style="color: rgb(255, 255, 255); line-height: 35px; margin-left: 15px;">Error</span><div class="dynamsoft-dialog-close dynamsoft-dialog-hide-lna"></div></div><div class="dynamsoft-dwt-ltsdlg-body" style="padding: 25px 40px 20px;">',
        ObjString,
        ,'</div></div>'
      ].join('');

      var newDiv = document.createElement('div');
      Dynamsoft.Lib.setHtml(newDiv, newDialogWrapper);
			existDialog.appendChild(newDiv);
      oldDialogContent.style.display = 'none';

      document.querySelector('.dynamsoft-dialog-hide-lna').addEventListener('click', function(){
        newDiv.remove();
        oldDialogContent.style.display = '';
      });
    } else {
      Dynamsoft.DWT.ShowMessage(ObjString, {
        width: promptDlgWidth,
        headerStyle: 2,
        closeButton: false
      });
    }

  }


  Dynamsoft.ProcessLicenseErrorContent = function (content) {
    var el = [],
      _content = content;
    if (typeof(_content) != 'string') {
      if (undefined === _content)
        return '';
      if (_content instanceof Error || 'message' in _content)
        _content = _content.message;
      else
        _content = '' + _content;
    }

    var posLeftBracket = _content.indexOf("[");
    var posRightBracket = _content.indexOf("]", posLeftBracket);
    var posLeftParentheses = _content.indexOf("(", posRightBracket);
    var posRightParentheses = _content.indexOf(")", posLeftParentheses);
    if (-1 == posLeftBracket || -1 == posRightBracket || -1 == posLeftParentheses || -1 == posRightParentheses) {
      return _content;
    }

    if (posLeftBracket > 0) {
      el.push(_content.substring(0, posLeftBracket));
    }

    var linkText = _content.substring(posLeftBracket + 1, posRightBracket);
    var linkAddr = _content.substring(posLeftParentheses + 1, posRightParentheses);

    el.push(['<a href="', linkAddr, '" target="_blank" class="dynamsoft-major-color">', linkText, '</a>'].join(''));
    el.push(_content.substring(posRightParentheses + 1));

    return el.join('');
  }
  //--------------------end Product Key-------------------------------


})();