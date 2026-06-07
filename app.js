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
    refreshHLBDropdown
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
  .querySelectorAll(
    'input[type="text"]'
  )
  .forEach(function(field){

    field.addEventListener(
      "input",
      function(){

        this.value =
        this.value.toUpperCase();

      }
    );

  });

});
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
function validateForm(){

  if(!document.getElementById('censusPost').value){

    showToast(
      "Please Select Census Post",
      "#d32f2f"
    );

    document.getElementById(
      'censusPost'
    ).focus();

    return false;

  }

  if(!document.getElementById('circleNo').value){

    showToast(
      "Please Select Circle Number",
      "#d32f2f"
    );

    document.getElementById(
      'circleNo'
    ).focus();

    return false;

  }

  if(
    document.getElementById(
      'censusPost'
    ).value === "Enumerator"
    &&
    !document.getElementById(
      'hlbNo'
    ).value
  ){

    showToast(
      "Please Select HLB Number",
      "#d32f2f"
    );

    document.getElementById(
      'hlbNo'
    ).focus();

    return false;

  }

  if(
    !document.getElementById(
      'designation'
    ).value.trim()
  ){

    showToast(
"Please Enter Designation",
"#d32f2f"
);

document
.getElementById(
"designation"
)
.focus();

return false;
  }

  if(
    !document.getElementById(
      'officeName'
    ).value.trim()
  ){

    showToast(
      "Please Enter Office Name",
      "#d32f2f"
    );

    document
.getElementById(
"officeName"
)
.focus();

    return false;

  }

  if(
    !document.getElementById(
      'officeAddress'
    ).value.trim()
  ){

    showToast(
      "Please Enter Office Address",
      "#d32f2f"
    );

    document
.getElementById(
"officeAddress"
)
.focus();

    return false;

  }

  if(
    !document.getElementById(
      'ifscCode'
    ).value.trim()
  ){

    showToast(
      "Please Enter IFSC Code",
      "#d32f2f"
    );

    document
.getElementById(
"ifscCode"
)
.focus();

    return false;

  }

  if(
    !document.getElementById(
      'bankName'
    ).value.trim()
  ){

    showToast(
      "Please Enter Valid IFSC Code",
      "#d32f2f"
    );

    return false;

  }

  if(
    !document.getElementById(
      'accountNumber'
    ).value.trim()
  ){

    showToast(
      "Please Enter Account Number",
      "#d32f2f"
    );

    document
.getElementById(
"accountNumber"
)
.focus();

    return false;

  }

  if(
    !document.getElementById(
      'consent1'
    ).checked
  ){

    showToast(
      "Please Accept Declaration 1",
      "#d32f2f"
    );

    document
.getElementById(
"consent1"
)
.focus();

    return false;

  }

  if(
    !document.getElementById(
      'consent2'
    ).checked
  ){

    showToast(
      "Please Accept Declaration 2",
      "#d32f2f"
    );
document
.getElementById(
"consent2"
)
.focus();

    return false;

  }

  return true;

}

function saveData(){

  if(!validateForm()){
    return;
  }

  let params = new URLSearchParams({

    action:"save",

    circleNo:
    document.getElementById("circleNo").value,

    hlbNo:
    document.getElementById("censusPost").value === "Supervisor"
    ? ""
    : document.getElementById("hlbNo").value,

    censusPost:
    document.getElementById("censusPost").value,

    supervisorName:
    document.getElementById("supervisorName").value,

    enumeratorName:
    document.getElementById("enumeratorName").value,

    designation:
    document.getElementById("designation").value,

    officeName:
    document.getElementById("officeName").value,

    officeAddress:
    document.getElementById("officeAddress").value,

    ifsc:
    document.getElementById("ifscCode").value,

    bankName:
    document.getElementById("bankName").value,

    branchName:
    document.getElementById("branchName").value,

    branchAddress:
    document.getElementById("branchAddress").value,

    accountNumber:

    document
    .getElementById("accountNumber")
    .value
    .includes("XXXXXXXX")

    ?

    window.actualAccountNumber

    :

    document
    .getElementById("accountNumber")
    .value

  });

  fetch(
    API_URL +
    "?" +
    params.toString()
  )

  .then(r=>r.json())

  .then(function(data){

    showToast(
      data.message,
      "#2e7d32"
    );

  })

  .catch(function(err){

    console.error(err);

    showToast(
      "Save Failed",
      "#d32f2f"
    );

  });

}

function fetchIFSCDetails(){

  const ifsc =

  document
  .getElementById(
    'ifscCode'
  )
  .value
  .trim()
  .toUpperCase();

  if(!ifsc){

    document
    .getElementById(
      'bankName'
    ).value='';

    document
    .getElementById(
      'branchName'
    ).value='';

    document
    .getElementById(
      'branchAddress'
    ).value='';

    return;

  }

  fetch(

    API_URL +
    "?action=ifsc" +
    "&ifsc=" +
    encodeURIComponent(ifsc)

  )

  .then(r=>r.json())

  .then(function(data){

    if(!data.success){

      showToast(
        "Invalid IFSC Code",
        "#d32f2f"
      );

      clearBankFields();

      return;

    }

    document
    .getElementById(
      'bankName'
    ).value =
    data.bankName || '';

    document
    .getElementById(
      'branchName'
    ).value =
    data.branchName || '';

    document
    .getElementById(
      'branchAddress'
    ).value =
    data.branchAddress || '';

  })

  .catch(function(){

    showToast(
      "Unable to Verify IFSC",
      "#d32f2f"
    );

  });

}

function resetForm(){

  document.getElementById(
    "censusPost"
  ).value='';

  document.getElementById(
    "circleNo"
  ).selectedIndex=0;

  document.getElementById(
    "supervisorName"
  ).value='';

  document.getElementById(
    "supervisorMobile"
  ).value='';

  document.getElementById(
    "hlbNo"
  ).innerHTML =
  '<option value="">Select</option>';

  document.getElementById(
    "enumeratorName"
  ).value='';

  document.getElementById(
    "mobileNumber"
  ).value='';

  window.actualAccountNumber='';

  clearBankFields();

  document.getElementById(
    "consent1"
  ).checked=false;

  document.getElementById(
    "consent2"
  ).checked=false;

  enableEditing();

  document.getElementById(
    "saveBtn"
  ).disabled=true;

}

function disableEditing(){

  document.getElementById(
    'designation'
  ).disabled=true;

  document.getElementById(
    'officeName'
  ).disabled=true;

  document.getElementById(
    'officeAddress'
  ).disabled=true;

  document.getElementById(
    'ifscCode'
  ).disabled=true;

  document.getElementById(
    'accountNumber'
  ).disabled=true;

}

function enableEditing(){

  document.getElementById(
    'designation'
  ).disabled=false;

  document.getElementById(
    'officeName'
  ).disabled=false;

  document.getElementById(
    'officeAddress'
  ).disabled=false;

  document.getElementById(
    'ifscCode'
  ).disabled=false;

  document.getElementById(
    'accountNumber'
  ).disabled=false;

}

function clearBankFields(){

  document.getElementById(
    'designation'
  ).value='';

  document.getElementById(
    'officeName'
  ).value='';

  document.getElementById(
    'officeAddress'
  ).value='';

  document.getElementById(
    'ifscCode'
  ).value='';

  document.getElementById(
    'bankName'
  ).value='';

  document.getElementById(
    'branchName'
  ).value='';

  document.getElementById(
    'branchAddress'
  ).value='';

  document.getElementById(
    'accountNumber'
  ).value='';

}

function showToast(
  message,
  color
){

  const toast =
  document.getElementById(
    "toast"
  );

  toast.innerHTML =
  message;

  toast.style.display =
  "block";

  toast.style.background =
  color || "#2e7d32";

  setTimeout(
    function(){

      toast.style.display =
      "none";

    },
    3000
  );

}

function checkConsent(){

  const c1 =
  document.getElementById(
    "consent1"
  ).checked;

  const c2 =
  document.getElementById(
    "consent2"
  ).checked;

  document.getElementById(
    "saveBtn"
  ).disabled =
  !(c1 && c2);

}
