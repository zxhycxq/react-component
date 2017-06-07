/**
 * Created by Aus on 2017/6/2.
 */
import React from 'react'
import classNames from 'classnames'
import PickerView from './PickerView'
import Touchable from 'rc-touchable'
import moment from 'moment'

const monthArray = [
    {label: "1月", value: "0"},{label: "2月", value: "1"},{label: "3月", value: "2"},{label: "4月", value: "3"},
    {label: "5月", value: "4"},{label: "6月", value: "5"},{label: "7月", value: "6"},{label: "8月", value: "7"},
    {label: "9月", value: "8"},{label: "10月", value: "9"},{label: "11月", value: "10"},{label: "12月", value: "11"}
];

const hourArray = [
    {label: "0点", value: "0"},{label: "1点", value: "1"},{label: "2点", value: "2"},{label: "3点", value: "3"},
    {label: "4点", value: "4"},{label: "5点", value: "5"},{label: "6点", value: "6"},{label: "7点", value: "7"},
    {label: "8点", value: "8"},{label: "9点", value: "9"},{label: "10点", value: "10"},{label: "11点", value: "11"},
    {label: "12点", value: "12"},{label: "13点", value: "13"},{label: "14点", value: "14"},{label: "15点", value: "15"},
    {label: "16点", value: "16"},{label: "17点", value: "17"},{label: "18点", value: "18"},{label: "19点", value: "19"},
    {label: "20点", value: "20"},{label: "21点", value: "21"},{label: "22点", value: "22"},{label: "23点", value: "23"}
];

// 日期时间选择器
class DatePicker extends React.Component {
    static defaultProps = {
        mode: "date",
        value: moment(),
        timeStep: 5
    };
    static propTypes = {
        mode: React.PropTypes.string, // 模式：枚举类型：日期date 时间time 日期时间datetime 年year 月moth 默认是date
        value: React.PropTypes.object, // moment类型
        title: React.PropTypes.string, // 标题
        timeStep: React.PropTypes.number, // time模式下 时间的步长 值为60的约数如1，2，3，4，5，6，10，12，15，20，30，60
        maxValue: React.PropTypes.object, // 最大值 <=
        minValue: React.PropTypes.object // 最小值 >=
    };
    constructor (props) {
        super(props);
        this.state = {
            defaultValue: undefined,
            selectedValue: undefined,
            animation: "out",
            show: false
        }
    }
    componentDidMount () {
        // picker 当做一个非受控组件
        let {value} = this.props;
        this.setState({
            defaultValue: value,
            selectedValue: value
        });
    }
    handlePickerViewChange (newValue) {
        // picker view回调的时候
        const {mode} = this.props;

        switch (mode) {
            case "date":
                // 检验新日期是否合法
                // 年月一定合法 主要就是检验日
                const newMaxDate = this.checkDaysByYearMonth(moment(newValue[0] + "-" + (Number.parseInt(newValue[1]) + 1), "YYYY-MM"));

                if(newValue[2] > newMaxDate){
                    newValue[2] = newMaxDate + "";
                }

                let newDateMoment = moment([Number.parseInt(newValue[0]), Number.parseInt(newValue[1]), Number.parseInt(newValue[2])]);
                this.setState({
                    selectedValue: newDateMoment
                });
                break;
            case "time":
                // 时间切换
                let newTimeMoment = moment(`${newValue[0]}:${newValue[1]}`, "HH:mm");
                this.setState({
                    selectedValue: newTimeMoment
                });
                break;
            case "datetime":
                const datetimeMaxDate = this.checkDaysByYearMonth(moment(newValue[0] + "-" + (Number.parseInt(newValue[1]) + 1), "YYYY-MM"));

                if(newValue[2] > datetimeMaxDate){
                    newValue[2] = datetimeMaxDate + "";
                }

                let newDateTimeMoment = moment([Number.parseInt(newValue[0]), Number.parseInt(newValue[1]), Number.parseInt(newValue[2]), Number.parseInt(newValue[3]), Number.parseInt(newValue[4])]);
                this.setState({
                    selectedValue: newDateTimeMoment
                });
                break;

                break;
        }
    }
    handleClickOpen (e) {

        if(e) e.preventDefault();

        this.setState({
            show: true
        });

        let t = this;
        let timer = setTimeout(()=>{
            t.setState({
                animation: "in"
            });
            clearTimeout(timer);
        }, 0);
    }
    handleClickClose (e) {

        if(e) e.preventDefault();

        this.setState({
            animation: "out"
        });

        let t = this;
        let timer = setTimeout(()=>{
            t.setState({
                show: false
            });
            clearTimeout(timer);
        }, 300);
    }
    handleCancel () {
        const {defaultValue} = this.state;
        const {onCancel} = this.props;

        this.handleClickClose();

        this.setState({
            selectedValue: defaultValue
        });

        if(onCancel){
            onCancel();
        }
    }
    handleConfirm () {
        // 点击确认之后的回调
        const {selectedValue} = this.state;

        this.handleClickClose();

        // 更新默认值
        this.setState({
            defaultValue: selectedValue
        });

        if (this.props.onChange) this.props.onChange(selectedValue);
    }
    checkDaysByYearMonth (value) {
        const month = value.month();

        // 判断大小月
        if([0,2,4,6,7,9,11].indexOf(month) >= 0){
            // 大月 31天
            return 31;
        } else if ([3,5,8,10].indexOf(month) >= 0) {
            // 小月 30天
            return 30;
        } else {
            // 2月 判断是否闰年
            if(moment([value.year()]).isLeapYear()){
                // 闰年 29天
                return 29;
            }

            return 28;
        }
    }
    getYearArray () {
        // 获取年数组
        let {selectedValue} = this.state;
        const {maxValue, minValue} = this.props;

        let yearArray = [];
        let currentYear = selectedValue.year();

        for(let i = currentYear - 5; i < currentYear + 5; i++){

            if(maxValue && !minValue){
                // 上限
                if(i <= maxValue.year()){
                    yearArray.push({label: i + "年", value: i + ''});
                }
            } else if (!maxValue && minValue) {
                if(i >= minValue.year()){
                    yearArray.push({label: i + "年", value: i + ''});
                }
            } else if (maxValue && minValue) {
                if(i <= maxValue.year() && i >= minValue.year()){
                    yearArray.push({label: i + "年", value: i + ''});
                }
            }
        }

        return yearArray;
    }
    getMonthArray () {
        let result = monthArray.concat();
        let {selectedValue} = this.state;
        const {maxValue, minValue} = this.props;

        if(maxValue && !minValue){
            // 上限
           if(selectedValue.year() == maxValue.year()){
               result = monthArray.filter((item) => {
                   if(maxValue.month() >= Number.parseInt(item.value)) return true;
               });
           }
        } else if (!maxValue && minValue) {
            if(selectedValue.year() == minValue.year()){
                result = monthArray.filter((item) => {
                    if(minValue.month() <= Number.parseInt(item.value)) return true;
                });
            }
        } else if (maxValue && minValue) {
            result = monthArray.filter((item) => {
                if(maxValue.month() >= Number.parseInt(item.value) && Number.parseInt(item.value) <= minValue.month()) return true;
            });
        }

        return result;
    }
    getDateArray () {
        let dayArray = [];
        let {selectedValue} = this.state;
        const {maxValue, minValue} = this.props;

        const daysMax = this.checkDaysByYearMonth(selectedValue);

        for(let i = 1; i < daysMax + 1; i++){
            if(maxValue && !minValue){
                // 上限
                if(selectedValue.year() == maxValue.year() && selectedValue.month() == maxValue.month()){
                    if(i <= maxValue.date()){
                        dayArray.push({label: i + "日", value: i + ''});
                    }
                }
            } else if (!maxValue && minValue) {
                if(selectedValue.year() == minValue.year() && selectedValue.month() == minValue.month()){
                    if(i >= maxValue.date()){
                        dayArray.push({label: i + "日", value: i + ''});
                    }
                }
            } else if (maxValue && minValue) {
                if((selectedValue.year() == maxValue.year() && selectedValue.month() == maxValue.month()) || (selectedValue.year() == minValue.year() && selectedValue.month() == minValue.month())){
                    if(selectedValue.year() == maxValue.year() && selectedValue.month() == maxValue.month()){
                        if(i <= maxValue.date()){
                            dayArray.push({label: i + "日", value: i + ''});
                        }
                    } else {
                        if(selectedValue.year() == minValue.year() && selectedValue.month() == minValue.month()){
                            if(i >= maxValue.date()){
                                dayArray.push({label: i + "日", value: i + ''});
                            }
                        }
                    }
                }
            }
        }

        return dayArray;
    }
    getDateByMode (mode) {
        let result = [];
        let todayMoment = moment();
        let {selectedValue} = this.state;

        switch (mode) {
            case "date":
                // 只有日期
                // 选取今年的前后5年
                const dateYearArray = this.getYearArray();

                // 判断月 只有年在限制的时候 才限制月
                const dateMonthArray = this.getMonthArray();

                // 准备日 根据值判断当月有多少天
                const dateDateArray = this.getDateArray();

                result = [dateYearArray, dateMonthArray, dateDateArray];
                break;
            case "time":
                // 时间其实是一个固定的数组 和一个根据步长算出来的数组
                const {timeStep} = this.props;

                let timeArray = [];

                const length = 60 / timeStep;

                for(let i = 0; i < length; i++){
                    timeArray.push({label: timeStep * i + "分", value: timeStep * i + ""});
                }

                result = [hourArray, timeArray];
                break;
            case "datetime":
                // 时间日期选择器
                let yearsArray = [];
                let recentYear = Number.parseInt(todayMoment.format("YYYY"));

                for(let i = recentYear - 5; i < recentYear + 5; i++){
                    yearsArray.push({label: i + "年", value: i + ''});
                }

                // 准备日 根据值判断当月有多少天
                const dayMax = this.checkDaysByYearMonth(selectedValue);

                let daysArray = [];
                for(let i = 1; i < dayMax + 1; i++){
                    daysArray.push({label: i + "日", value: i + ''});
                }

                let minutesArray = [];

                for(let i = 0; i < 60; i++){
                    minutesArray.push({label:  i + "分", value: i + ""});
                }

                result = [yearsArray, monthArray, daysArray, hourArray, minutesArray];
                break;
        }

        return result;
    }
    getPickerView () {
        // 根据mode不同 准备不同数据
        // date picker中的picker view 应该是不级联
        const {mode} = this.props;
        const {selectedValue, show} = this.state;

        if(selectedValue != undefined && show){
            const data = this.getDateByMode(mode);

            if(mode == "date"){
                return <PickerView
                    col={3}
                    data={data}
                    value={[selectedValue.year() + '', selectedValue.month() + '', selectedValue.date() + '']}
                    cascade={false}
                    onChange={this.handlePickerViewChange.bind(this)}>
                </PickerView>;
            } else if (mode == "time") {
                return <PickerView
                    col={2}
                    data={data}
                    value={[selectedValue.hour() + '', selectedValue.minute() + '']}
                    cascade={false}
                    onChange={this.handlePickerViewChange.bind(this)}>
                </PickerView>;
            } else if (mode == "datetime") {
                return <PickerView
                    col={5}
                    data={data}
                    value={[selectedValue.year() + '', selectedValue.month() + '', selectedValue.date() + '', selectedValue.hour() + '', selectedValue.minute() + '']}
                    cascade={false}
                    onChange={this.handlePickerViewChange.bind(this)}>
                </PickerView>;
            }
        }
    }
    getPopupDOM () {
        const {show, animation} = this.state;
        const {title} = this.props;
        const pickerViewDOM = this.getPickerView();

        if(show){
            return <div>
                <Touchable
                    onPress={this.handleCancel.bind(this)}>
                    <div className={classNames(['zby-picker-popup-mask', {'hide': animation == "out"}])}></div>
                </Touchable>
                <div className={classNames(['zby-picker-popup-wrap', {'popup': animation == "in"}])}>
                    <div className="zby-picker-popup-header">
                        <Touchable
                            onPress={this.handleCancel.bind(this)}>
                            <span className="zby-picker-popup-item zby-header-left">取消</span>
                        </Touchable>
                        <span className="zby-picker-popup-item zby-header-title">{title}</span>
                        <Touchable
                            onPress={this.handleConfirm.bind(this)}>
                            <span className="zby-picker-popup-item zby-header-right">确定</span>
                        </Touchable>
                    </div>
                    <div className="zby-picker-popup-body">
                        {pickerViewDOM}
                    </div>
                </div>
            </div>
        }
    }
    render () {
        const popupDOM = this.getPopupDOM();

        return (
            <div className="zby-picker-box">
                {popupDOM}
                <Touchable
                    onPress={this.handleClickOpen.bind(this)}>
                    {this.props.children}
                </Touchable>
            </div>
        )
    }
}

export default DatePicker