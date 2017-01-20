#!/usr/bin/gjs

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk; 

var msiklm = {
	setGamingMode: function(state) {
		let error;
		try {
			GLib.spawn_command_line_sync('msiklm -M'+(state?'gaming':'normal'), null, null, null, error);
		} catch(e) {
			throw e;
		}
	},

	setColor: function(args) {
		let error;
		try {
			// print(args.region+'='+args.color);
			GLib.spawn_command_line_sync('msiklm --color_' + args.region + '=0x' + args.color, null, null, null, error);
		} catch(e) {
			throw e;
		}
	}
};

var global = {
	initGSettings: function() {
		// Init GSettings
		let schema_id = 'org.seb.msiklm';
		let path = '/org/seb/msiklm/';
		let schema_source = Gio.SettingsSchemaSource.new_from_directory('data/', 
               				Gio.SettingsSchemaSource.get_default(), false);
		let schema = schema_source.lookup(schema_id, false);
		if(!schema) {
    			print("Cannot get GSettings  schema");
		}
		return Gio.Settings.new_full(schema, null, path);
	}
};

const HelloWorld = new Lang.Class({
	Name: 'MSIKeyboardManager',
	
	_init: function() {
		this.application = new Gtk.Application();
		this.application.connect('activate', Lang.bind(this, this._onActivate));
		this.application.connect('startup', Lang.bind(this, this._onStartup));
	},

	_onActivate: function(){
		this._window.present();
	},

	_onStartup: function() {
		let builder = new Gtk.Builder();
		builder.add_from_file('msiklm_ui.glade');
		this._window = builder.get_object('window1');
		
		this._switch = builder.get_object('switch1');
		this._switch.connect('state-set', Lang.bind(this, this._switchStateSet));

		this._leftColorButton = builder.get_object('leftColorButton');
		this._leftColorButton.connect('color-set', Lang.bind(this, this._leftColorSet));
		
		this._middleColorButton = builder.get_object('middleColorButton');
		this._middleColorButton.connect('color-set', Lang.bind(this, this._middleColorSet));
		
		this._rightColorButton = builder.get_object('rightColorButton');
		this._rightColorButton.connect('color-set', Lang.bind(this, this._rightColorSet));
		
		this._settings = global.initGSettings();
		this._settings.bind('gaming-mode', this._switch, 'active', Gio.SettingsBindFlags.DEFAULT);

		msiklm.setColor({region:'left', color:this._settings.get_string('left-color')});
		msiklm.setColor({region:'middle', color:this._settings.get_string('middle-color')});
		msiklm.setColor({region:'right', color:this._settings.get_string('right-color')});

		let c = new Gdk.RGBA();
		c.parse('#' + this._settings.get_string('left-color'));	
		this._leftColorButton.set_rgba(c);
		c.parse('#' + this._settings.get_string('middle-color'));	
		this._middleColorButton.set_rgba(c);
		c.parse('#' + this._settings.get_string('right-color'));	
		this._rightColorButton.set_rgba(c);
	
		this.application.add_window(this._window);
	},

	_switchStateSet: function() {
		msiklm.setGamingMode(this._switch.active);
	},

	_leftColorSet: function() {
		let hex_color = this._hex(this._leftColorButton.color);
		this._settings.set_string('left-color', hex_color);
		msiklm.setColor({region:'left', color:hex_color});	
	},

	_middleColorSet: function() {
		let hex_color = this._hex(this._middleColorButton.color);
		this._settings.set_string('middle-color', hex_color);
		msiklm.setColor({region:'middle', color:hex_color});	
	},

	_rightColorSet: function() {
		let hex_color = this._hex(this._rightColorButton.color);
		this._settings.set_string('right-color', hex_color);
		msiklm.setColor({region:'right', color:hex_color});	
	},

	_hex: function(color) {
		let r, g, b, hex_rgb;

		r = (color.red) / 256 | 0;
		g = (color.green) / 256 | 0;
		b = (color.blue) / 256 | 0;
		r = (r < 16) ? ('0' + r.toString(16)) : r.toString(16);
		g = (g < 16) ? ('0' + g.toString(16)) : g.toString(16);
		b = (b < 16) ? ('0' + b.toString(16)) : b.toString(16);
		
		return r + g + b;
	},

	_setColor: function(args) {
		msiklm.setColor({region:args.region, color:args.colorihex});	
	}
});

if(ARGV.length == 1 && ARGV[0] == '-s') {
	let settings = global.initGSettings();
	msiklm.setGamingMode(settings.get_boolean('gaming-mode'));
	msiklm.setColor({region:'left', color:settings.get_string('left-color')});
	msiklm.setColor({region:'middle', color:settings.get_string('middle-color')});
	msiklm.setColor({region:'right', color:settings.get_string('right-color')});
} else {
	let app = new HelloWorld();
	app.application.run(ARGV);
}

