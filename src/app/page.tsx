'use client'

import Image from "next/image";
import Navbar from "../components/Navbar";
import { QueryClient,
  QueryClientProvider, useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "@/components/Container";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import WeatherIcon from "@/components/WeatherIcon";
import getDayOrNightIcon from "@/utils/getDayOrNightIcon";
import WeatherDetails from "@/components/WeatherDetails";
import { meterstoKilometers } from "@/utils/metersToKilometers";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "./atom";
import { useEffect } from "react";

// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
// https://api.openweathermap.org/data/2.5/weather?q=pune&appid=afd7a52252aff2414e1324ff8a62af9f&cnt=56

interface WeatherData {
    cod: string;
    message: number;
    cnt: number;
    list: WeatherListItem[];
    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
        
    };
}

interface WeatherListItem {
    dt: number;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    visibility: number;
    pop: number;
    sys: {
      pod: string;
      
    };
    dt_txt: string;
}

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_KEY;

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom)
  const [loadingCity, ] = useAtom(loadingCityAtom);


  const { isLoading, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ['repoData'],
    queryFn: async () => {
      const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${API_KEY}&cnt=56`);
      return data;
    }
    // fetch('https://api.openweathermap.org/data/2.5/forecast?q=pune&appid=afd7a52252aff2414e1324ff8a62af9f').then((res) =>
    //   res.json(),
    // ),
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  // console.log("data", data)
  const firstData = data?.list[0];
  // console.log(firstData?.dt_txt)
  console.log(data);
  // filtering unique dates
  // 
  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  // filtering data to get the first entry after 6 am for each unique date
  const firstDateForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading) return (<div className="flex items-center min-h-screen justify-center text-gray-500 text-3xl ">
      <p className="animate-bounce">Loading...</p>
  </div>
  );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={ data?.city.name } />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4 ">
        {/* today data */}
        {loadingCity ? (<SkeletonLoading />) :
          <>
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end">
                  <p> {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")} </p>
                  <p className="text-lg"> ({format(parseISO(firstData?.dt_txt ?? ""), "dd-MM-yyyy")}) </p>
                </h2>
                <Container className="gap-10 px-6 items-center">
                  {/* temperature */}
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">
                      {convertKelvinToCelsius(firstData?.main.temp ?? 0)}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}°
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}°↓{" "}
                      </span>
                      <span>
                        {" "}
                        {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}°↑
                      </span>
                    </p>
                  </div>
                  {/* time and weather icon */}
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                        <p className="whitespace-nowrap">{format(parseISO(d.dt_txt), "h:mm a")}</p>
                        {/* <WeatherIcon iconName={ d.weather[0].icon }></WeatherIcon> */}
                        <WeatherIcon iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)} />
                        <p>{convertKelvinToCelsius(d?.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className="flex gap-4">
                {/* left */}
                <Container className="w-fit justify-center flex-col px-4 items-center">
                  <p className="capitalize text-center">{firstData?.weather[0].description}</p>
                  <WeatherIcon iconName={getDayOrNightIcon(firstData?.weather[0].icon ?? "", firstData?.dt_txt ?? "")} />
                </Container>
                {/* right */}
                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visibility={meterstoKilometers(firstData?.visibility ?? 0)}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 0)}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702949452), "H:mm")}
                    sunset={format(fromUnixTime(data?.city.sunset ?? 1702949452), "H:mm")}
                  />
                </Container>
              </div>
            </section>

            {/*  7-day forecast data  */}
            <section className="flex w-full flex-col gap-4">
              <p className="text-2xl">Forecast (7 days)</p>
              {firstDateForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "N/A"}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd-MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702949452), "H:mm")}
                  sunset={format(fromUnixTime(data?.city.sunset ?? 1702949452), "H:mm")}
                  visibility={`${meterstoKilometers(d?.visibility ?? 0)}`}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 0)}`}
                />

              ))}
            </section>
          </>}
      </main>
   </div>
  );
}


function SkeletonLoading () {
  return (
    <div className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4 ">
      {/* Today's data skeleton loading */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="flex gap-1 text-2xl items-end">
            <div className="animate-pulse h-5 w-32 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
          </h2>
          <div className="flex flex-col px-4">
            <div className="animate-pulse h-16 w-32 bg-gray-200 rounded"></div>
            <div className="flex justify-between">
              <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col justify-between gap-2 items-center text-xs font-semibold">
                <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          {/* Left side skeleton loading */}
          <div className="w-fit justify-center flex-col px-4 items-center">
            <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
          {/* Right side skeleton loading */}
          <div className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
            <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>

      {/* 7-day forecast skeleton loading */}
      <section className="flex w-full flex-col gap-4">
        <p className="text-2xl">Forecast (7 days)</p>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex gap-1 items-center">
              <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
              <div className="animate-pulse h-5 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between">
              <div className="animate-pulse h-16 w-32 bg-gray-200 rounded"></div>
              <div className="flex gap-4">
                <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
                <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};


