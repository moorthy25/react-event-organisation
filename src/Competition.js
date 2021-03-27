import { useState, useEffect } from "react";
import Navbar from "./navbar";
import { getCookie } from './utilities'
// import './checkout'


const Competition = () => {
    const [competition, setCompet] = useState([{ price: 0 }])
    const [index, setIndex] = useState(0)
    const [price, setPrice] = useState('')
    const [disabled, setDisable] = useState(false)

    const [Name, setName] = useState('')
    const [Email, setEmail] = useState('')
    const [Mobile, setMobile] = useState('')
    const [Order, setOrder] = useState('')


    // checking login is present
    const email = getCookie('email')
    if (email == "") {
        window.location = "../login"
    }


    const LoginData = { email };
    fetch('http://localhost:3010/validate', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(LoginData)
    }).then((success) => {
        if (success.ok) {
            success.json().then(json => {
                if (json.email != undefined) {
                    setName(json.name)
                    setEmail(json.email)
                    setMobile(json.phone_no)
                } else
                    window.location.href = "/"
            });
        }
    }, (fail) => { alert(fail); window.location.href = "/" })
        .catch((err) => {
            console.log(err);
            window.location.href = "/"
            // alert('Error while signup')
        })

    // end of login present component


    useEffect(() => {
        const abortCont = new AbortController();
        fetch('http://localhost:3010/competition_details', { signal: abortCont.signal }).then(res => res.json().then(res => {
            setCompet(res.success)
        }), rej => {
            console.log(rej)
        })
            .catch(rej => console.log(rej))
        // abort the fetch
        return () => abortCont.abort();
    }, [])

    useEffect(() => {
        setPrice(competition[index].price);
    }, [index])


    // integrate payment
    var options = {
        key: "rzp_test_H0l7ruuVdzWaFR", // Enter the Key ID generated from the Dashboard
        amount: price * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "AMC BCA Dept",
        description: "Test Transaction for Hover registration",
        image: "https://ams.americancollege.edu.in/ams/images/aclogin_logofinal.png",
        order_id: Order, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        callback_url: "http://localhost:3010/paymentSuccess",
        prefill: {
            name: Name,
            email: Email,
            contact: Mobile
        },
        notes: {
            "address": "The american college,Madurai"
        },
        theme: {
            "color": "#3399cc"
        }
    };

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }


    // document.getElementById('rzp-button1').onclick = function(e){
    //     rzp1.open();
    //     e.preventDefault();
    // }
    const getOrderId = () => {
        const LoginData = { amount: price };
        // console.log(JSON.stringify(LoginData))
        fetch('http://localhost:3010/payment', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(LoginData)
        }).then((success) => {
            if (success.ok) {
                success.json().then(async (json) => {
                    console.log(json);
                    setOrder(json.order.id)
                    const res=await loadScript("https://checkout.razorpay.com/v1/checkout.js")
                    if (!res) {
                        alert("Razorpay SDK failed to load. Are you online?");
                        return;
                    }
                    var rzp1 = new window.Razorpay(options);
                    rzp1.open();
                });
            }
        }, (fail) => { alert("payment error:" + fail) })
            .catch((err) => {
                console.log(err);
                alert('Error while initiate payment')
            })
    }




    return (
        <div className="comp_root">
            <Navbar />
            <div className="books">
                <select name="" id="" onChange={(e) => {
                    setIndex(e.target.value);
                    setDisable(true);
                }}>
                    <option disabled={disabled} value="" >Select Competition</option>
                    {competition &&
                        competition.map((compet, index) => {
                            return (
                                <option value={index}>{compet.competition_name}</option>
                            );
                        })}
                </select>
                <h2>Price : {price}</h2>
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                <button id="rzp-button1" onClick={(e) => {
                    getOrderId()
                    e.preventDefault();
                }
                }>Pay & Register</button>

            </div>
        </div>

    );
}

export default Competition;