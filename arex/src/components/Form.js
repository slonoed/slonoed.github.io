import { Component, findDOMNode } from 'react';
import { parse } from '../lib/csv';

export default class Form extends Component {
    constructor() {
        super();

        this.state = { error: '' };
    }

    // Save button handler. Try to parse contracts.
    onClick(e) {
        e.preventDefault();
        this.updateData(findDOMNode(this.refs.input).value);
    }

    // Textarea change handler. Clear error.
    onChange() {
        this.setState({ error: '' });
    }

    // File input change handler. Try to parse contracts.
    onFileChange(e) {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = e => this.updateData(e.target.result);
            reader.readAsText(file);
        }
    }

    // Update contracts with text.
    // Call onChange property if success, set error if fail.
    updateData(text) {
        try {
            const contracts = parse(text);
            this.props.onChange(contracts);
            findDOMNode(this.refs.input).value = text;
        } catch (e) {
            this.setState({ error: 'Check data format' });
        }
    }

    render() {
        const { error } = this.state;
        const { defaultValue } = this.props;
        return <div style={S.form}>
            <textarea
                ref="input"
                style={S.input}
                defaultValue={defaultValue}
                onChange={e => this.onChange(e)}/>
            <div style={S.error}>{error}</div>
            <button style={S.btn} onClick={e => this.onClick(e)}>
                Save changes
            </button>

            {/* render file button only if FileReader is present */}
            {window.FileReader && <span>&nbsp;or&nbsp;</span>}
            {window.FileReader && <input type="file" onChange={e => this.onFileChange(e)}/>}
        </div>;
    }
}

const S = {
    form: {
        width: 500,
        margin: '1rem auto'
    },
    input: {
        display: 'block',
        minHeight: 100,
        width: '100%',
        marginBottom: '1rem',
    },
    error: {
        marginRight: '1rem',
        color: 'red',
        marginBottom: '1rem'
    }
}
