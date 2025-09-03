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

    this.homeAssistantSocket = null;
    this.name = "Home assistant Deckboard";
    this.platforms = [PLATFORMS.WINDOWS, PLATFORMS.MAC, PLATFORMS.LINUX];
    this.inputs = [
      {
        label: "Display Entity Value",
        value: "display-entity-value",
        icon: "eye",
        color: "#03A9F4",
        input: [
          {
            label: "Entity ID",
            ref: "entity_id",
            type: INPUT_METHOD.INPUT_TEXT,
            placeholder: "sensor.temperature_living_room"
          }
        ]
      }
    ];

    this.configs = {
      homeAssistantUrl: {
        descriptions: "Home Assistant WebSocket URL (e.g. localhost:8123)",
        name: "Home Assistant URL",
        type: "text",
        value: "",
      },
      homeAssistantToken: {
        descriptions: "Long-Lived Access Token from Home Assistant",
        name: "Access Token",
        type: "text",
        value: "",
      },
    };
    this.entityStates = {};
    this.initExtension();
    this.homeAssistantSocket = null;
  }

  // Executes when the extensions loaded every time the app start.
  initExtension() {
    this.initPlugin().catch((e) => log.error(e));
    this.connectHomeAssistant();
  }

  async connectHomeAssistant() {
    const configUrl = this.configs.homeAssistantUrl.value;
    const url = configUrl.startsWith('ws://') || configUrl.startsWith('wss://') ? configUrl : `ws://${configUrl}/api/websocket`;
    const token = this.configs.homeAssistantToken.value;
    if (!url || !token) {
      log.error("Home Assistant URL or Token not set.");
      return;
    }
    try {
      this.homeAssistantSocket = new WebSocket(url);
      this.homeAssistantSocket.onopen = () => {
        log.error("WebSocket connected to Home Assistant");
        // Send authentication message
        this.homeAssistantSocket.send(JSON.stringify({
          type: "auth",
          access_token: token
        }));
      };
      this.homeAssistantSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Subscribe to state_changed events after auth OK
          if (data.type === "auth_ok") {
            this.subscribeStateChanged();
            this.fetchAllStates();
          }
          // Handle state_changed events
          if (data.type === "event" && data.event && data.event.event_type === "state_changed") {
            const entity = data.event.data.entity_id;
            const state = data.event.data.new_state ? data.event.data.new_state.state : undefined;
            if (entity && state !== undefined) {
              this.entityStates[entity] = state;
            }
          }
          // Handle get_states response
          if (data.type === "result" && Array.isArray(data.result)) {
            data.result.forEach(e => {
              this.entityStates[e.entity_id] = e.state;
            });
          }
        } catch (err) {
          log.error("WebSocket message error:", err);
        }
      };
      this.homeAssistantSocket.onerror = (err) => {
        log.error("WebSocket error:", err);
      };
      this.homeAssistantSocket.onclose = () => {
        log.error("WebSocket closed");
      };
    } catch (e) {
      log.error("Failed to connect to Home Assistant WebSocket:", e);
    };

    subscribeStateChanged() {
      if (!this.homeAssistantSocket || this.homeAssistantSocket.readyState !== 1) return;
      const requestId = Math.floor(Math.random() * 1000000);
      this.homeAssistantSocket.send(JSON.stringify({
        id: requestId,
        type: "subscribe_events",
        event_type: "state_changed"
      }));
    }

    fetchAllStates() {
      if (!this.homeAssistantSocket || this.homeAssistantSocket.readyState !== 1) return;
      const requestId = Math.floor(Math.random() * 1000000);
      this.homeAssistantSocket.send(JSON.stringify({
        id: requestId,
        type: "get_states"
      }));
    }
  }

  get selections() {
    return [
      {
        header: this.name,
      },
      ...this.inputs,
    ];
  }

  async displayEntityValue({ entity_id }) {
    if (!entity_id) {
      log.error("No entity_id provided");
      return;
    }
    // Use cached state
    const state = this.entityStates[entity_id];
    if (state !== undefined) {
      this.setValue({ ["display-entity-value"]: state });
      return state;
    } else {
      this.setValue({ ["display-entity-value"]: "Not found" });
      return "Not found";
    }
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

  async execute(action, args) {
    if (!this.homeAssistantSocket) {
      log.error("Home Assistant socket is not connected");
      return;
    }
    if (action === "display-entity-value") {
      return await this.displayEntityValue(args);
    }
  }
}

module.exports = (sendData) => new HomeAssistantExtension(sendData);