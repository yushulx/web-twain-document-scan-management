import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './product-list/product-list.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { AcquireImageComponent } from './acquire-image/acquire-image.component';

import { DynamicWebTWAINService } from './dynamic-web-twain.service';
import { ImageEditorComponent } from './image-editor/image-editor.component';
import { RemoteScanComponent } from './remote-scan/remote-scan.component';
console.log('run module');
@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    TopBarComponent,
    AcquireImageComponent,
    ImageEditorComponent,
    RemoteScanComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
    DynamicWebTWAINService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
