namespace WinFormDocumentScanner
{
    partial class DocumentScanner
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.blazor = new Microsoft.AspNetCore.Components.WebView.WindowsForms.BlazorWebView();
            this.SuspendLayout();
            // 
            // blazor
            // 
            this.blazor.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.blazor.Location = new System.Drawing.Point(0, 0);
            this.blazor.Name = "blazor";
            this.blazor.Size = new System.Drawing.Size(328, 491);
            this.blazor.TabIndex = 0;
            this.blazor.Text = "blazor";
            // 
            // DocumentScanner
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(329, 494);
            this.Controls.Add(this.blazor);
            this.Name = "DocumentScanner";
            this.Text = "DocumentScanner";
            this.ResumeLayout(false);

        }

        #endregion

        private Microsoft.AspNetCore.Components.WebView.WindowsForms.BlazorWebView blazor;
    }
}