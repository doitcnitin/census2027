const API_URL =
"https://script.google.com/macros/s/AKfycbw5O5MyRFpp8HOPlr4Yw95LjMXB-1PEBPGmYpwjRcKONg69LuOPCI8uY_3V-YQ8-A_-Yg/exec";

window.actualAccountNumber = '';

document.addEventListener(
"DOMContentLoaded",
function(){

  loadCircles();

  document
  .getElementById("censusPost")
  .addEventListener(
    "change",
    function(){

      refreshHLBDropdown();

      if(
        this.value === "Supervisor"
        &&
        document.getElementById(
          "circleNo"
        ).value
      ){
        loadExistingData();
      }

    }
  );

  document
  .getElementById("circleNo")
  .addEventListener(
    "change",
    onCircleChange
  );

  document
  .getElementById("hlbNo")
  .addEventListener(
    "change",
    onHLBChange
  );

  document
  .getElementById("ifscCode")
  .addEventListener(
    "blur",
    fetchIFSCDetails
  );

  document
  .getElementById("consent1")
  .addEventListener(
    "change",
    checkConsent
  );

  document
  .getElementById("consent2")
  .addEventListener(
    "change",
    checkConsent
  );

  document
  .getElementById("saveBtn")
  .addEventListener(
    "click",
    saveData
  );

  document
  .getElementById("clearBtn")
  .addEventListener(
    "click",
    resetForm
  );

});

function loadCircles(){

  fetch(
    API_URL +
    "?action=circles"
  )

  .then(r=>r.json())

  .then(function(circles){

    const dropdown =
    document.getElementById(
      "circleNo"
    );

    dropdown.innerHTML =
    '<option value="">Select</option>';

    circles.forEach(circle=>{

      dropdown.innerHTML +=
      `<option value="${circle}">
      ${circle}
      </option>`;

    });

  })

  .catch(function(err){

    console.error(err);

    showToast(
      "Unable to load circles",
      "#d32f2f"
    );

  });

}

function loadHLBs(hlbs){

  let hlb =
  document.getElementById(
    "hlbNo"
  );

  hlb.innerHTML =
  '<option value="">Select</option>';

  hlbs.forEach(h=>{

    hlb.innerHTML +=
    `<option value="${h}">
    ${h}
    </option>`;

  });

}

function onCircleChange(){

  const circle =
  this.value;

  if(!circle){

    document.getElementById(
      "supervisorName"
    ).value='';

    document.getElementById(
      "supervisorMobile"
    ).value='';

    return;
  }

  Promise.all([

    fetch(
      API_URL +
      "?action=supervisor" +
      "&circleNo=" +
      encodeURIComponent(circle)
    )
    .then(r=>r.json()),

    fetch(
      API_URL +
      "?action=hlbs" +
      "&circleNo=" +
      encodeURIComponent(circle)
    )
    .then(r=>r.json())

  ])

  .then(function(result){

    const supData =
    result[0];

    const hlbData =
    result[1];

    document
    .getElementById(
      "supervisorName"
    )
    .value =
    supData.supervisorName || '';

    document
    .getElementById(
      "supervisorMobile"
    )
    .value =
    supData.supervisorMobile || '';

    refreshHLBDropdown();

    if(
      document
      .getElementById(
        "censusPost"
      )
      .value === "Enumerator"
    ){

      loadHLBs(
        hlbData
      );

    }

    if(
      document
      .getElementById(
        "censusPost"
      )
      .value === "Supervisor"
    ){

      loadExistingData();

    }

  })

  .catch(function(err){

    console.error(err);

    showToast(
      "Unable to load circle details",
      "#d32f2f"
    );

  });

}

function refreshHLBDropdown(){

  const post =
  document.getElementById(
    "censusPost"
  ).value;

  const circle =
  document.getElementById(
    "circleNo"
  ).value;

  const hlb =
  document.getElementById(
    "hlbNo"
  );

  if(
    post !== "Enumerator"
  ){

    hlb.disabled = true;

    hlb.innerHTML =
    '<option value="">Not Applicable</option>';

    document
    .getElementById(
      "enumeratorName"
    )
    .value='';

    document
    .getElementById(
      "mobileNumber"
    )
    .value='';

    return;
  }

  hlb.disabled = false;

  if(!circle){

    hlb.innerHTML =
    '<option value="">Select Circle First</option>';

    return;
  }

  fetch(

    API_URL +
    "?action=hlbs" +
    "&circleNo=" +
    encodeURIComponent(circle)

  )

  .then(r=>r.json())

  .then(loadHLBs)

  .catch(function(err){

    console.error(err);

  });

}

function onHLBChange(){

  const circle =
  document
  .getElementById(
    "circleNo"
  )
  .value;

  const hlb =
  document
  .getElementById(
    "hlbNo"
  )
  .value;

  if(
    !circle ||
    !hlb
  ){
    return;
  }

  fetch(

    API_URL +
    "?action=enumerator" +
    "&circleNo=" +
    encodeURIComponent(circle) +
    "&hlbNo=" +
    encodeURIComponent(hlb)

  )

  .then(r=>r.json())

  .then(function(data){

    document
    .getElementById(
      "enumeratorName"
    )
    .value =
    data.enumeratorName || '';

    document
    .getElementById(
      "mobileNumber"
    )
    .value =
    data.mobile || '';

    loadExistingData();

  })

  .catch(function(err){

    console.error(err);

    showToast(
      "Unable to load Enumerator",
      "#d32f2f"
    );

  });

}

function loadExistingData(){

  enableEditing();

  let circle =
  document.getElementById(
    "circleNo"
  ).value;

  let hlb =
  document.getElementById(
    "hlbNo"
  ).value;

  let post =
  document.getElementById(
    "censusPost"
  ).value;

  if(!circle || !post){
    return;
  }

  if(
    post === "Enumerator"
    &&
    !hlb
  ){
    return;
  }

  if(
    post === "Supervisor"
  ){
    hlb = "";
  }

  fetch(

    API_URL +
    "?action=loadExistingRecord" +
    "&circleNo=" +
    encodeURIComponent(circle) +
    "&hlbNo=" +
    encodeURIComponent(hlb) +
    "&censusPost=" +
    encodeURIComponent(post)

  )

  .then(r=>r.json())

  .then(function(data){

    if(
      !data ||
      !data.found
    ){

      clearBankFields();

      return;
    }

    document
    .getElementById(
      "designation"
    )
    .value =
    data.designation || '';

    document
    .getElementById(
      "officeName"
    )
    .value =
    data.officeName || '';

    document
    .getElementById(
      "officeAddress"
    )
    .value =
    data.officeAddress || '';

    document
    .getElementById(
      "ifscCode"
    )
    .value =
    data.ifsc || '';

    document
    .getElementById(
      "bankName"
    )
    .value =
    data.bankName || '';

    document
    .getElementById(
      "branchName"
    )
    .value =
    data.branchName || '';

    document
    .getElementById(
      "branchAddress"
    )
    .value =
    data.branchAddress || '';

    window.actualAccountNumber =
    data.actualAccountNumber || '';

    document
    .getElementById(
      "accountNumber"
    )
    .value =
    data.accountNumber || '';

    if(
      String(
        data.editAllowed
      ).toUpperCase()
      === "FALSE"
    ){

      disableEditing();

      document
      .getElementById(
        "saveBtn"
      )
      .disabled = true;

      showToast(
        "Record already submitted. Contact Administrator for correction.",
        "#d32f2f"
      );

    }
    else{

      document
      .getElementById(
        "saveBtn"
      )
      .disabled = false;

    }

  })

  .catch(function(err){

    console.error(err);

    showToast(
      "Unable to load existing record",
      "#d32f2f"
    );

  });

}
