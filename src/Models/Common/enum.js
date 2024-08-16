const pickupTypeEnumValues = ["1", "2", "3"];
const rideTypeEnumValues = ["1", "2", "3"];

const paymentMethodEnumValues = ['card', 'deposit']



module.exports = {
    pickupTypeEnumValues,
    rideTypeEnumValues,
    paymentMethodEnumValues
}


/* 

pickupType : {
    1 => will be used to deliver / transport  
    2 => will also be used to buy and deliver
    3 => provide service only    (accepts ride type 3)
}

rideType : {
    1 => point A to B with in city 
    2 => point A to B outside city
    3 => point A to A with in city

}

if pickupType is 1 then supported rideTypes are 1 and 2 
if pickupType is 2 then supported rideTypes are 1
if pickupType is 3 then supported rideTypes are 3



paymentMethodEnumValues => {
    deposit => user balance ,
    card => 1 card attached against user -> will be used for all transactions 
}




*/
