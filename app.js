const API_URL =
"https://script.google.com/macros/s/AKfycbw5O5MyRFpp8HOPlr4Yw95LjMXB-1PEBPGmYpwjRcKONg69LuOPCI8uY_3V-YQ8-A_-Yg/exec";

window.onload = function(){

fetch(
API_URL +
"?action=circles"
)

.then(response =>
response.json()
)

.then(loadCircles)

.catch(err=>{

alert(
"Error Loading Circles"
);

console.error(err);

});

};

function loadCircles(circles){

const dropdown =
document.getElementById(
"circleNo"
);

dropdown.innerHTML =
'<option value="">Select</option>';

circles.forEach(circle=>{

dropdown.innerHTML +=
`
<option value="${circle}">
${circle}
</option>
`;

});

}
document
.getElementById("circleNo")
.addEventListener(
"change",
function(){

const circle =
this.value;

if(!circle){
return;
}

fetch(

API_URL +
"?action=hlbs" +
"&circleNo=" +
encodeURIComponent(circle)

)

.then(r=>r.json())

.then(loadHLBs);

}
);
