import {  getQrcode } from "../services/userService";

export function    displayModalQRCode(btnQRCode , userId, username, container)
{

    btnQRCode.onclick = async () => 
    {
        if (btnQRCode.checked)
        {
            try
            {
                const bigD = document.createElement("div");
                bigD.classList.add("bigD");
                container.appendChild(bigD);

                const divQrcode = document.createElement("div");
                divQrcode.classList.add("divQrCode")
                
                const divCross = document.createElement("div");
                divCross.style.textAlign = "right";
                
                const btnCross = document.createElement("button");
                btnCross.innerHTML = "X";
                btnCross.className = "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-5";
                
                divCross.appendChild(btnCross);
                divQrcode.appendChild(divCross);
                
                const   divImageQr = document.createElement("div");
                divImageQr.classList.add("divImageQr")
                
                
                divQrcode.appendChild(divImageQr);
                
                /*      CHECKER DANS LA DB SI 2FAENABLED ON
                SI NON getQROCDE
                SI OUI get dans la DB           */
                const image = document.createElement("img");
                getQrcode(userId, username).then((data) => {
                    if (data)
                        image.src = data;
                    divImageQr.append(image);
                });

                const linkApp = document.createElement("p");
                linkApp.innerHTML = "Scanner le QRCODE sur Google Authenticator";
                divQrcode.appendChild(linkApp);            
                
                const hrefAppAndroid = document.createElement("a");
                hrefAppAndroid.href = "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr";
                hrefAppAndroid.target = "_blank";
                hrefAppAndroid.innerHTML = "Google Authenticator for Android<br>";
                divQrcode.appendChild(hrefAppAndroid);
                
                const hrefAppIOS = document.createElement("a");
                hrefAppIOS.href = "https://apps.apple.com/fr/app/google-authenticator/id388497605";
                hrefAppIOS.target = "_blank";
                hrefAppIOS.innerHTML = "Google Authenticator for IOS";
                divQrcode.appendChild(hrefAppIOS);
                
                container.append(divQrcode);
                console.log(image.src);
                
                btnCross.onclick = async () => {
                    container.removeChild(divQrcode);
                    container.removeChild(bigD);
                }
            }
            catch (error) 
            {
                console.error("❌ Erreur QRcode :", error);
                alert("Erreur QRcode");
            }
        }
        else
        {
            container.removeChild("divQrcode");
        }

    };
}