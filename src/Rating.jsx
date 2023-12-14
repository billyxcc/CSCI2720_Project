import React, { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';

// Rating component
const Rating = (props) => {
    const [show, setShow] = useState(false);
    const [rating, setRating] = useState(0);

    useEffect(()=>{
        const fetchLocationRating = async () => {
            const response = await fetch(`http://localhost:80/rating/${props.locId}`);
            const newRating = await response.json();
            setRating(newRating.averageRating);
        }
        fetchLocationRating();
    });

    const handleClick = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleRating = async (rate) => {
        const data = {
            value: rate,
        }
    
        // use POST method to send a request to the server
        const response = await fetch(`http://localhost:80/rating/${props.locId}`, { //put your server address here
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const statusCode = await response.json();
        setShow(false);
    }

    return (
        <div style={{display:"flex",alignItems:"center",flexDirection:"row-reverse"}}>
        {!show && <button onClick={handleClick}>Rate</button>}
        {show?
            <div style={{marginLeft:"20px"}}>
            <span className="close" onClick={handleClose}>×</span>
            <p>Please rate this location:{console.log(show)}</p>
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRating(star)}>
                <FaRegStar/>
                </button>
            ))}
            </div>:""
        }
        {rating > 0 && !show && <div style={{marginRight:"20px"}}>
                {(rating>0)?<FaStar onClick={()=>setRating(1)} style={{ color: 'gold' }}/>:<FaRegStar onClick={()=>setRating(1)}/>}
                {(rating>1)?<FaStar onClick={()=>setRating(2)} style={{ color: 'gold' }}/>:<FaRegStar onClick={()=>setRating(2)}/>}
                {(rating>2)?<FaStar onClick={()=>setRating(3)} style={{ color: 'gold' }}/>:<FaRegStar onClick={()=>setRating(3)}/>}
                {(rating>3)?<FaStar onClick={()=>setRating(4)} style={{ color: 'gold' }}/>:<FaRegStar onClick={()=>setRating(4)}/>}
                {(rating>4)?<FaStar onClick={()=>setRating(5)} style={{ color: 'gold' }}/>:<FaRegStar onClick={()=>setRating(5)}/>}
            </div>}
        </div>
    );
};

export default Rating;
