using Microsoft.AspNetCore.Components.WebView;

namespace ScanToPDF
{
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();
            blazorWebView.BlazorWebViewInitializing += WebView_BlazorWebViewInitializing;
        }

        private void WebView_BlazorWebViewInitializing(object sender, BlazorWebViewInitializingEventArgs e)
        {
#if IOS || MACCATALYST
            e.Configuration.AllowsInlineMediaPlayback = true;
            e.Configuration.MediaTypesRequiringUserActionForPlayback = WebKit.WKAudiovisualMediaTypes.None;
#endif
        }

    }
}
