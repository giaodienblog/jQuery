ul_now=$(location).attr('href');ul_menu=$('.vertical-nav-menu>li>');for(var i=0;i<ul_menu.length;i++){if(ul_menu[i].href==ul_now)ul_menu[i].classList.add("mm-active");}
ul_menu=$('.vertical-nav-menu>li>ul>li>a');for(var i=0;i<ul_menu.length;i++){if(ul_menu[i].href==ul_now)ul_menu[i].classList.add("mm-active");}
ul_menu=$('.vertical-nav-menu>li');for(var i=0;i<ul_menu.length;i++){if(ul_menu[i].querySelectorAll("a[class*='active']")[0]){ul_menu[i].classList.add("mm-active");var v=ul_menu[i];setTimeout(function(){v.scrollIntoView(1);},2000);}}
$.fn.serializeObject=function(){var o={};var a=this.serializeArray();$.each(a,function(){if(o[this.name]){if(!o[this.name].push){o[this.name]=[o[this.name]];}
o[this.name].push(this.value||'');}else{o[this.name]=this.value||'';}});return o;};function toquery(obj){var str="";for(var key in obj){if(str!=""){str+="&";}
str+=key+"="+encodeURIComponent(obj[key]);}
return str;}
function setCookie(name,value,days){var expires="";if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));expires="; expires="+date.toUTCString();}
document.cookie=name+"="+(value||"")+expires+"; path=/";}
function getCookie(name){var nameEQ=name+"=";var ca=document.cookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' ')c=c.substring(1,c.length);if(c.indexOf(nameEQ)==0)return c.substring(nameEQ.length,c.length);}
return null;}
$.ajaxSetup({headers:{'X-Csrf-Token':$('meta[name="csrf-token"]').attr('content')}});moment.locale('vi');$(document).ready(function(){window.formdata=function(id){const data=$(id).serializeObject();data.api_token=lt.api_token;return data;}
window.formview=function(api,limit=1000){const data={};data.limit=limit;data.type_api=api;data.type_method='view';data.api_token=lt.api_token;return data;}
window.formstatus=function(api,limit=1000){const data={};data.limit=limit;data.type_api=api;data.type_method='status';data.api_token=lt.api_token;return data;}});var flags=document.getElementsByClassName('flag_link');Array.prototype.forEach.call(flags,function(e){e.addEventListener('click',function(){var lang=e.getAttribute('data-lang');var languageSelect=document.querySelector("select.goog-te-combo");languageSelect.value=lang;languageSelect.dispatchEvent(new Event("change"));});});function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:'vi'},'google_translate_element');}