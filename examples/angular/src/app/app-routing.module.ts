import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { AcquireImageComponent } from './acquire-image/acquire-image.component';
import { ImageEditorComponent } from './image-editor/image-editor.component';
import { RemoteScanComponent } from './remote-scan/remote-scan.component';

const routes: Routes = [
  { path: '', component: ProductListComponent },
      { path: 'acquire-image', component: AcquireImageComponent },
      { path: 'image-editor', component: ImageEditorComponent },
      { path: 'remote-scan', component: RemoteScanComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
