'use babel';
import KvnLangView from './kvn-lang-view';
import {
	CompositeDisposable
} from 'atom';

const provider = require('./provider');

export default {
	kvnLangView: null,
	modalPanel: null,
	subscriptions: null,
	activate(state) {
		this.kvnLangView = new KvnLangView(state.kvnLangViewState);
		this.modalPanel = atom.workspace.addModalPanel({
			item: this.kvnLangView.getElement(),
			visible: false
		});
		// Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
		this.subscriptions = new CompositeDisposable();
		// Register command that toggles this view
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'kvn-lang:toggle': () => this.toggle()
		}));
	},
	deactivate() {
		this.modalPanel.destroy();
		this.subscriptions.dispose();
		this.kvnLangView.destroy();
	},
	serialize() {
		return {
			kvnLangViewState: this.kvnLangView.serialize()
		};
	},
	toggle() {
		console.log('KvnLang was toggled!');
		return (
			this.modalPanel.isVisible() ?
			this.modalPanel.hide() :
			this.modalPanel.show()
		);
	},
  getProvider() {
		console.log("fired!!!")
    return provider;
  }
};
