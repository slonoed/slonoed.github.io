import { Component } from 'react';
import { merge, assign } from 'lodash';
import moment from 'moment';

const limit = 2;

export default class Day extends Component {
    constructor() {
        super();

        // When day contain more then limit number of contracts
        // render only limit number and render "Show more" button
        this.state = { expanded: false };
    }

    expand(e) {
        e.preventDefault();
        this.setState({ expanded: true });
    }

    collapse(e) {
        e.preventDefault();
        this.setState({ expanded: false });
    }

    render() {
        let { expanded } = this.state;

        const { date, contracts } = this.props;
        const length = contracts.length;
        // total amount
        const amount = contracts.reduce((a, c) => a + c.amount, 0);
        const contractsToRender = expanded ?
            contracts :
            contracts.slice(0, limit);

        const innerStyle = merge({}, S.inner, expanded ? {
            zIndex: 100,
            boxShadow: '0px 6px 49px 3px rgba(0,0,0,0.75)'
        } : {});
        return <div style={S.day}>
            {expanded && <div style={S.paranja} onClick={e => this.collapse(e)}></div>}

            <div style={innerStyle}>
                {this.renderDate(date)}

                {length > 0 && <div style={S.total}>
                    {length === 1 ? 'One contract' : `${length} contracts`}
                    {'€' + amount.toFixed(2)}
                </div>}
                {contractsToRender.map(this.renderContract)}
                {(contracts.length > limit && !expanded) && this.renderMore(contracts)}
            </div>

        </div>
    }

    // Render day of month
    renderDate(date) {
        const style = merge({}, S.date);
        if (date.isBefore(moment(), 'day')) {
            style.color = '#999';
        }
        return <div style={style}>
            {date.date()}
        </div>;
    }

    renderContract(contract) {
        return <div style={S.contract} id={contract.id}>
            {contract.date.format('HH:mm')}
            <br/>
            {'€' + contract.amount.toFixed(2)}
            <br/>
            {'#' + contract.id}
        </div>
    }

    renderMore(contracts) {
        const hidded = contracts.length - limit;
        return <div style={S.more} onClick={e => this.expand(e)}>
            {hidded} more...
            <br/>
            <small>click to expand</small>
        </div>
    }
}


const S = {
    day: {
        flex: 1,
        height: '14rem',
        borderLeft: '1px solid #e5e4e5',
        borderBottom: '1px solid #e5e4e5',
        paddingBottom: '0.5rem',
        position: 'relative',
        backgroundColor: '#fff'
    },
    inner: {
        padding: '0.5rem',
        paddingBottom: 0,
        position: 'relative',
        backgroundColor: '#fff'
    },
    date: {
        position: 'absolute',
        right: '0.4rem',
        top: '0.5rem',
        fontWeight: 300
    },
    total: {
        fontWeight: 400,
        marginBottom: '0.5rem'
    },
    contract: {
        fontSize: '0.9rem',
        padding: '0.3rem 0.5rem',
        margin: '0 -0.5rem',
        backgroundColor: '#E0F9E0',
        borderBottom: '1px solid #cec'
    },
    more: {
        padding: '0.5rem 0',
        fontWeight: 400,
        cursor: 'pointer'
    },
    paranja: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 50
    }
}
