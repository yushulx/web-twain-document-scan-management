/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';

class MyView1 extends PolymerElement {
  MyView1() {
    this.dwtObj;
    this.deviceList = [];
  }
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
      </style>

      <div class="card">
        <h1>Web Document Scan</h1>
        <select size="1" id="source" style="position: relative; width: 220px;"></select>
        <div id="dwtcontrolContainer"></div>
        <button on-click="handleClick">scan</button>
      </div>
    `;
  }

  ready() {
    super.ready();
    // TODO: initialization
    this.initializeDWT();
  }

  initializeDWT() {
    if (Dynamsoft) {
      Dynamsoft.DWT.AutoLoad = true;
      Dynamsoft.DWT.UseLocalService = true;
      // https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
      Dynamsoft.DWT.ProductKey = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
      Dynamsoft.DWT.ResourcesPath = 'node_modules/dwt/dist/';
      Dynamsoft.DWT.CreateDWTObjectEx({ WebTwainId: 'Viewer' }, (obj) => {
        this.dwtObj = obj;
        obj.Viewer.bind(this.shadowRoot.querySelector('#dwtcontrolContainer'));
        obj.Viewer.width = 560;
        obj.Viewer.height = 600;
        obj.Viewer.show();

        let select = this.shadowRoot.querySelector('#source');
        let deviceList = this.deviceList = [];
        obj.GetDevicesAsync().then(function (devices) {
          for (var i = 0; i < devices.length; i++) {
            let option = document.createElement('option');
            option.value = devices[i].displayName;
            option.text = devices[i].displayName;
            deviceList.push(devices[i]);
            select.appendChild(option);
          }
        }).catch(function (exp) {
          alert(exp.message);
        });

      }, function (e) {
        console.log(e)
      });
    }
  }

  handleClick() {
    var obj = this.dwtObj;
    if (obj) {
      obj.SelectDeviceAsync(this.deviceList[this.shadowRoot.querySelector('#source').selectedIndex]).then(function () {
        return obj.AcquireImageAsync({
          IfShowUI: false,
          IfCloseSourceAfterAcquire: true
        });
      }).catch(function (exp) {
        alert(exp.message);
      });
    }
  }
}

window.customElements.define('my-view1', MyView1);
