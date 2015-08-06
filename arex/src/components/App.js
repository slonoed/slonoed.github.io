import { Component } from 'react';
import moment from 'moment';
import { parse } from '../lib/csv';
import data from '../outstanding.csv';

import Calendar from './Calendar';
import Form from './Form';

export default class App extends Component {
    constructor() {
        super();

        // initial contracts data from outstanding.csv
        this.state = { contracts: parse(data) };
    }

    // Form change handler. Update contracts.
    onNewContracts(contracts) {
        this.setState({ contracts });
    }

    render() {
        const { contracts } = this.state;

        return <div style={S.app}>
            <Form defaultValue={data} onChange={c => this.onNewContracts(c)}/>
            <Calendar contracts={contracts}/>
        </div>;
    }
}

const S = {
    app: { maxWidth: 1000, margin: '0 auto' }
};
