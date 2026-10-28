import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import './assets/dwt-scanner.html';
import styles from './DynamicWebTwainWebPart.module.scss';
import * as strings from 'DynamicWebTwainWebPartStrings';

export interface IDynamicWebTwainWebPartProps {
  description: string;
  scannerPageUrl: string;
}

export default class DynamicWebTwainWebPart extends BaseClientSideWebPart<IDynamicWebTwainWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private get _resolvedScannerPageUrl(): string {
    if (this.properties.scannerPageUrl) {
      return this.properties.scannerPageUrl;
    }
    const manifest = this.context.manifest as any;
    const baseUrls: string[] | undefined = manifest?.loaderConfig?.internalModuleBaseUrls;
    if (baseUrls && baseUrls.length > 0) {
      const distUrl = baseUrls[0].replace(/\/+$/, '');
      const libUrl = distUrl.replace(/\/dist$/, '') + '/lib';
      return libUrl + '/webparts/dynamicWebTwain/assets/dwt-scanner.html';
    }
    if (this.context.isServedFromLocalhost) {
      return 'https://localhost:4321/lib/webparts/dynamicWebTwain/assets/dwt-scanner.html';
    }
    return '';
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  public render(): void {
    const scannerUrl = this._resolvedScannerPageUrl;

    if (!scannerUrl) {
      this.domElement.innerHTML = `
        <section class="${styles.dynamicWebTwain}">
          <div class="${styles.placeholder}">
            Please configure the <strong>Scanner Page URL</strong> in the web part property pane.
          </div>
        </section>`;
      return;
    }

    this.domElement.innerHTML = `
      <section class="${styles.dynamicWebTwain} ${!!this.context.sdks.microsoftTeams ? styles.teams : ''}">
        <iframe
          src="${this._escapeHtml(scannerUrl)}"
          class="${styles.iframe}"
          allow="loopback-network *; local-network *; local-network-access *"
          title="Dynamic Web TWAIN Scanner">
        </iframe>
      </section>`;
  }

  private _escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('scannerPageUrl', {
                  label: 'Scanner Page URL',
                  description: 'URL of the scanner HTML page. Defaults to local dev URL when running locally.'
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams':
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }
          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }
}
