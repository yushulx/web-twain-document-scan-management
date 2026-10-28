namespace WinFormDocumentScanner
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();

        }

        private void startScanButton_Click(object sender, EventArgs e)
        {
            DocumentScanner scanner = new DocumentScanner();
            scanner.Show();
        }
    }
}