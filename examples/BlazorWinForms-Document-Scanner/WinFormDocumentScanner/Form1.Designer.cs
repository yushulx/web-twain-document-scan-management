namespace WinFormDocumentScanner
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
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
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.startScanButton = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // startScanButton
            // 
            this.startScanButton.Location = new System.Drawing.Point(187, 127);
            this.startScanButton.Name = "startScanButton";
            this.startScanButton.Size = new System.Drawing.Size(105, 23);
            this.startScanButton.TabIndex = 0;
            this.startScanButton.Text = "Scan Document";
            this.startScanButton.UseVisualStyleBackColor = true;
            this.startScanButton.Click += new System.EventHandler(this.startScanButton_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(472, 285);
            this.Controls.Add(this.startScanButton);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);

        }

        #endregion
        private Button startScanButton;
    }
}