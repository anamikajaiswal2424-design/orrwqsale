import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import C1 from '../assets/1_s.webp';
import C2 from '../assets/2_s.webp';
import C3 from '../assets/3_s.webp';
import C4 from '../assets/4_s.webp';
import C5 from '../assets/5_s.webp';
import C6 from '../assets/6_s.webp';
import C7 from '../assets/7_s.webp';
import C8 from '../assets/8_s.webp';
import C9 from '../assets/9_s.webp';
import C10 from '../assets/10_s.webp';
import C11 from '../assets/11_s.webp';
import C12 from '../assets/12_s.webp';
import C13 from '../assets/13_s.webp';
import C14 from '../assets/14_s.webp';
import C15 from '../assets/15_s.webp';



const Slider = () => {
    const categories = [
        { name: "For You", img: C1 },
        { name: "Fashion", img: C2 },
        { name: "Mobile", img: C3 },
        { name: "Toys", img: C4 },
        { name: "Groceries", img: C5 },
        { name: "Fashion", img: C6 },
        { name: "Electronics", img: C7 },
        { name: "Home", img: C8 },
        { name: "Appliances", img: C9 },            
        { name: "Travel", img: C10 },
        { name: "Beauty", img: C11 },
        { name: "Sports", img: C12 },
        { name: "Automotive", img: C13 },
        { name: "Books", img: C14 },
        { name: "More", img: C15 },

    ];
    return (
        <Swiper
            spaceBetween={0}
            slidesPerView={6}
            className="bg-white"
        >
            {categories.map((item, index) => (
                <SwiperSlide>
                    <div key={index}>
                          <img src={item.img} alt={item.name} className="w-100 h-100 object-cover" />
                        {/* <p className="text-[10px] text-center">{item.name}</p> */}
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}

export default Slider