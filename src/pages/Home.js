import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Slider from '../components/Slider'
import Banner from "../assets/bn1.webp"
import { FaClock } from 'react-icons/fa';
import Data from '../Data';
import Card from '../components/Card';
import PolicySupport from './PolicySupport.js'

const Home = () => {
    const [data, setdata] = useState(Data)
    const [seconds, setSeconds] = useState(15 * 60);

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
        <>
            <Header />
            {/* <div className="mt-3">
                <Slider />
            </div> */}
            {/* <div className="pt-3">
                <img src={Banner} alt="" className="" />
            </div> */}
            {/* <div className="flex items-center justify-between py-3 px-4 border-y-8 border-slate-200">
                <div>
                    <div className="text-blue-600">Deals of the day</div>
                    <div className="text-blue-500 flex items-center text-[18px]"><FaClock className="mr-1" />{minutes}:{remainingSeconds}</div>
                </div>
                <div className="rounded-md shadow text-red-500 border border-slate-100 w-fit px-2 py-1">Sale is Live</div>
            </div> */}

    







            <div className="mt-4">
                <Card data={data} />
            </div>



<PolicySupport />

            
        </>
    )
}

export default Home
