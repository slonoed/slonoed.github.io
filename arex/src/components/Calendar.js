import { Component, findDOMNode } from 'react';
import moment from 'moment';
import 'moment-range';
import { chunk } from 'lodash';

import Day from './Day';

export default class Calendar extends Component {
    componentDidMount() {
        const today = findDOMNode(this.refs.today);
        today && today.scrollIntoView();
    }
    componentDidUpdate() {
        const today = findDOMNode(this.refs.today);
        today && today.scrollIntoView();
    }

    render() {
        const { contracts } = this.props;
        // sort contracts by date
        contracts.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime())

        // Prepare calendar data. Range  include all days with contracts +
        // additional days to align calendar items
        const range = moment.range(
            moment(contracts[0].date).startOf('month').startOf('week'),
            moment(contracts[contracts.length-1].date).endOf('month').endOf('week')
        );
        const days = [];
        range.by('days', function(date) {
            days.push({
                date,
                contracts: contracts.filter(c => c.date.isSame(date, 'day'))
            });
        });

        // Build days names
        const weekdays = 'Mo Tu We Th Fr Sa Sun'
            .split(' ')
            .map(l => <div style={S.weekday}>{l}</div>);
        weekdays.unshift(<div style={{flex:1, padding: '0.5rem'}}></div>);

        return <div style={S.calendar}>
            <div style={S.labels}>{weekdays}</div>
            <div>
                {chunk(days, 7).map(this.renderWeek)}
            </div>
        </div>;
    }

    /**
     * Render one week
     * @param  {Array} week array of days objects
     * @return {React.Element}
     */
    renderWeek(week) {
        // Render month name if week contain first day of month
        const month = week.find(d => d.date.date() === 1);

        return <div style={S.week}>
            <div style={S.month}>
                <div style={S.monthInner}>
                    {month && month.date.format('MMMM YYYY')}
                </div>
            </div>
            {week.map(d => d.date.isSame(moment(), 'day') ?
                <Day {...d} ref="today"/> :
                <Day {...d}/>)}
        </div>;
    }
}

const S = {
    calendar: {
        marginBottom: '2rem'
    },
    labels: {
        display: 'flex',
        flexDirection: 'row'
    },
    month: {
        flex: 1,
        textAlign: 'right'
    },
    monthInner: {
        padding: '0.5rem'
    },
    week: {
        display: 'flex',
        flexDirection: 'row',
        borderRight: '1px solid #e5e4e5'
    },
    weekday: {
        flex: 1,
        textAlign: 'right',
        padding: '0.5rem',
        borderBottom: '1px solid #e5e4e5'
    }
}
