/**
 * @autor Kybbe <https://github.com/kybbe>
 */

const util = require('util')
const { Extension, log, INPUT_METHOD, PLATFORMS } = require("deckboard-kit");

class HomeAssistantExtension extends Extension {
  constructor(props) {
    super(props);
    log.error(util.inspect(props, false, null, false /* enable colors */))
    this.dialog = props.dialog;
    this.setValue = props.setValue;
    this.setLabel = props.setLabel;
    this.data = props.data;

    this.name = "Home assistant Deckboard";
    this.platforms = [PLATFORMS.WINDOWS, PLATFORMS.MAC, PLATFORMS.LINUX];
    this.inputs = [
      /* {
        label: 'Toggle Headphone',
        value: "toggle-headphone",
        icon: "headphones",
        mode: 'custom-value',
        color: '#5865F2'
      },
      {
        label: "Microphone",
        value: "microphone",
        icon: "microphone",
        color: "#5865F2",
        input: [
          {
            label: "Action",
            ref: "action",
            type: INPUT_METHOD.INPUT_SELECT,
            items: [
              {
                value: "enable_microphone",
                label: "Enable Microphone",
              },
              {
                value: "disable_microphone",
                label: "Disable Microphone",
              },
            ],
          },
        ],
      }, */
    ];
    this.configs = {
      /* discordClientId: {
        descriptions: "Client ID in OAuth2 App",
        name: "Client ID",
        type: "text",
        value: "",
      },
      discordClientSecret: {
        type: "text",
        name: "Client Secret (not distribute)",
        descriptions: "Client Secret in OAuth2 App",
        value: "",
      }, */
    };
    this.initExtension();
  }

  // Executes when the extensions loaded every time the app start.
  initExtension() {
    this.initPlugin().catch((e) => log.error(e));
  }

  get selections() {
    return [
      {
        header: this.name,
      },
      ...this.inputs,
    ];
  }

  /* _labelMuteDeaf(value) {
    return value ? 'OFF' : 'ON';
  getAutocompleteOptions(ref) {
    switch (ref) {
      case "connectGuild":
        return this._getGuilds();
      case "channel_id":
        return this._getVoiceChannels();
      default:
        return [];
    }
  }

  async initPlugin() {
    try {
      if (this.configs.discordClientId.value === "") return;

      await this._client.login({
        clientId: this.configs.discordClientId.value,
        clientSecret: this.configs.discordClientSecret.value,
        scopes: this._scopes,
        redirectUri: this._redirectUri,
      });

      this.setValue({ 'toggle-microphone': this._labelMuteDeaf((await this._client.getVoiceSettings()).mute) });
      this.setValue({ 'toggle-headphone': this._labelMuteDeaf((await this._client.getVoiceSettings()).deaf) });
    } catch (e) {
      log.error(e);
    }
  }

  async _microphoneControlToggle({ action }) {
    var newMuteStatus = !(await this._client.getVoiceSettings()).mute;
    this.setValue({ 'toggle-microphone': this._labelMuteDeaf(newMuteStatus) });
    await this._client.setVoiceSettings({
      mute: newMuteStatus,
    });
  } */

  /* async _microphoneControl({ action }) {
    const functions = {
      enable_microphone: async () =>
        await this._client.setVoiceSettings({ mute: false }),
      disable_microphone: async () =>
        await this._client.setVoiceSettings({ mute: true }),
    };
    const executeFunction = functions[action];
    if (executeFunction) {
      return await executeFunction();
    }
  }

  async _headphoneControl({ action }) {
    const functions = {
      enable_headphone: async () =>
        await this._client.setVoiceSettings({ deaf: false }),
      disable_headphone: async () =>
        await this._client.setVoiceSettings({ deaf: true }),
    };

    const executeFunction = functions[action];
    if (executeFunction) {
      return await executeFunction();
    }
  } */

/*   async execute(action, args) {
    if (!this._client || !this._client.accessToken)
      return await this.initPlugin();
    switch (action) {
      case "toggle-microphone":
        return this._microphoneControlToggle(args);
      case "toggle-headphone":
        return this._headphoneControlToggle(args);
      case "microphone":
        return this._microphoneControl(args);
      case "headphone":
        return this._headphoneControl(args);
      case "disconnect-voice":
        return this._connectVoiceControl(args);
      case "connect-voice":
        return this._connectVoiceChannel(args);
      case "change-input":
        return this._changeVoiceInput(args);
    }
  } */
}

module.exports = (sendData) => new HomeAssistantExtension(sendData);