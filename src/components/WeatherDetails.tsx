import React from 'react'
import { IoEyeOutline } from "react-icons/io5";
import { WiBarometer, WiHumidity, WiSunrise, WiSunset } from "react-icons/wi";
import { FiWind } from "react-icons/fi";

export interface WeatherDetailProps {
    visibility: string;
    humidity: string;
    windSpeed: string;
    airPressure: string;
    sunrise: string;
    sunset: string;
}

export default function WeatherDetails(props: WeatherDetailProps) {
    const {
        visibility = "NA",
        humidity = "NA",
        windSpeed = "NA",
        airPressure = "NA",
        sunrise = "NA",
        sunset = "NA"
    } = props;
    
    return (
        <>
        <SingleWeatherDetail
            icon={<IoEyeOutline />}
            information="Visibility"
            value={visibility}
        />
        <SingleWeatherDetail
            icon={<WiHumidity />}
            information="Humidity"
            value={humidity}
        />
        <SingleWeatherDetail
            icon={<FiWind />}
            information="Wind Speed"
            value={windSpeed}
        />
        <SingleWeatherDetail
            icon={<WiBarometer />}
            information="Air Pressure"
            value={airPressure}
        />
        <SingleWeatherDetail
            icon={<WiSunrise />}
            information="Sunrise"
            value={sunrise}
        />
        <SingleWeatherDetail
            icon={<WiSunset />}
            information="Sunset"
            value={sunset}
        />
    </>
    );
}

export interface SingleWeatherDetailProps {
    information: string;
    icon: React.ReactNode;
    value: string;
}

function SingleWeatherDetail(props: SingleWeatherDetailProps) {
    return (
        <div className='flex flex-col justify-between gap-2 items-center text-xs font-semibold text-black/80'>
            <p className='whitespace-nowrap'>{props.information}</p>
            <div className='text-3xl'>{props.icon}</div>
            <p>{props.value}</p>
        </div>
    )
}