using Microsoft.AspNetCore.Components.WebView.WindowsForms;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WinFormDocumentScanner
{
    public partial class DocumentScanner : Form
    {
        public DocumentScanner()
        {
            InitializeComponent();
            var serviceCollection = new ServiceCollection();
            serviceCollection.AddBlazorWebView();
            blazor.Services = serviceCollection.BuildServiceProvider();
            blazor.HostPage = "wwwroot/index.html";
            blazor.RootComponents.Add<Scanner>("#app");
        }
    }
}
