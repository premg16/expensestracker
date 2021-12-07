(this.webpackJsonpspeechly=this.webpackJsonpspeechly||[]).push([[0],{361:function(e,t,a){},362:function(e,t,a){"use strict";a.r(t);var n=a(0),c=a.n(n),r=a(9),o=a.n(r),l=a(19),i=a(78),u=a(47),m=function(e,t){var a;switch(t.type){case"DELETE_TRANSACTION":return a=e.filter((function(e){return e.id!==t.payload})),localStorage.setItem("transactions",JSON.stringify(a)),a;case"ADD_TRANSACTION":return a=[t.payload].concat(Object(u.a)(e)),localStorage.setItem("transactions",JSON.stringify(a)),a;default:return e}},s=JSON.parse(localStorage.getItem("transactions"))||[{amount:500,category:"Salary",type:"Income",date:"2020-11-16",id:"44c68123-5b86-4cc8-b915-bb9e16cebe6a"},{amount:225,category:"Investments",type:"Income",date:"2020-11-16",id:"33b295b8-a8cb-49f0-8f0d-bb268686de1a"},{amount:50,category:"Salary",type:"Income",date:"2020-11-13",id:"270304a8-b11d-4e16-9341-33df641ede64"},{amount:123,category:"Car",type:"Expense",date:"2020-11-16",id:"0f72e66e-e144-4a72-bbc1-c3c92018635e"},{amount:50,category:"Pets",type:"Expense",date:"2020-11-13",id:"c5647dde-d857-463d-8b4e-1c866cc5f83e"},{amount:500,category:"Travel",type:"Expense",date:"2020-11-13",id:"365a4ebd-9892-4471-ad55-36077e4121a9"},{amount:50,category:"Investments",type:"Income",date:"2020-11-23",id:"80cf7e33-fc3e-4f9f-a2aa-ecf140711460"},{amount:500,category:"Savings",type:"Income",date:"2020-11-23",id:"ef090181-21d1-4568-85c4-5646232085b2"},{amount:5,category:"Savings",type:"Income",date:"2020-11-23",id:"037a35a3-40ec-4212-abe0-cc485a98aeee"}],d=Object(n.createContext)(s),p=function(e){var t=e.children,a=Object(n.useReducer)(m,s),r=Object(i.a)(a,2),o=r[0],l=r[1],u=o.reduce((function(e,t){return"Expense"===t.type?e-t.amount:e+t.amount}),0);return c.a.createElement(d.Provider,{value:{transactions:o,balance:u,deleteTransaction:function(e){l({type:"DELETE_TRANSACTION",payload:e})},addTransaction:function(e){l({type:"ADD_TRANSACTION",payload:e})}}},t)},f=a(410),y=a(90),b=a(404),E=a(406),g=a(407),O=a(41),v=a(168),h=a(401),j=Object(h.a)((function(){return{income:{borderBottom:"10px solid rgba(0, 255, 0, 0.5)"},expense:{borderBottom:"10px solid rgba(255, 0, 0, 0.5)"}}})),x=["#123123","#154731","#165f40","#16784f","#14915f","#10ac6e","#90ee90","#04e38d","#00ff9d"],I=["#b50d12","#bf2f1f","#c9452c","#d3583a","#dc6a48","#e57c58","#ee8d68","#f79d79","#ffae8a","#cc474b","#f55b5f"],C=[{type:"Business",amount:0,color:x[0]},{type:"Investments",amount:0,color:x[1]},{type:"Extra income",amount:0,color:x[2]},{type:"Deposits",amount:0,color:x[3]},{type:"Lottery",amount:0,color:x[4]},{type:"Gifts",amount:0,color:x[5]},{type:"Salary",amount:0,color:x[6]},{type:"Savings",amount:0,color:x[7]},{type:"Rental income",amount:0,color:x[8]}],T=[{type:"Bills",amount:0,color:I[0]},{type:"Car",amount:0,color:I[1]},{type:"Clothes",amount:0,color:I[2]},{type:"Travel",amount:0,color:I[3]},{type:"Food",amount:0,color:I[4]},{type:"Shopping",amount:0,color:I[5]},{type:"House",amount:0,color:I[6]},{type:"Entertainment",amount:0,color:I[7]},{type:"Phone",amount:0,color:I[8]},{type:"Pets",amount:0,color:I[9]},{type:"Other",amount:0,color:I[10]}],N=function(e){C.forEach((function(e){return e.amount=0})),T.forEach((function(e){return e.amount=0}));var t=Object(n.useContext)(d).transactions.filter((function(t){return t.type===e})),a=t.reduce((function(e,t){return e+t.amount}),0),c="Income"===e?C:T;t.forEach((function(e){var t=c.find((function(t){return t.type===e.category}));t&&(t.amount+=e.amount)}));var r=c.filter((function(e){return e.amount>0})),o={datasets:[{data:r.map((function(e){return e.amount})),backgroundColor:r.map((function(e){return e.color}))}],labels:r.map((function(e){return e.type}))};return{filteredCategories:r,total:a,chartData:o}},S=function(e){var t=e.title,a=e.subheader,n=N(t),r=n.total,o=n.chartData,l=j();return c.a.createElement(b.a,{className:"Income"===t?l.income:l.expense,raised:!0},c.a.createElement(E.a,{title:t,subheader:a}),c.a.createElement(g.a,null,c.a.createElement(O.a,{variant:"h5"},"$",r),c.a.createElement(v.Doughnut,{data:o})))},k=a(424),w=Object(h.a)((function(e){return{media:{height:0,paddingTop:"56.25%"},expand:{transform:"rotate(0deg)",marginLeft:"auto",transition:e.transitions.create("transform",{duration:e.transitions.duration.shortest})},expandOpen:{transform:"rotate(180deg)"},cartContent:{paddingTop:0},divider:{margin:"20px 0"}}})),D=a(10),A=a(411),B=a(428),R=a(425),_=a(415),P=a(430),F=a(416),J=a(143),L=a(427),W=a(426),$=Object(h.a)((function(e){return{root:{width:"100%","& > * + *":{marginTop:e.spacing(2)}}}})),H=function(e){var t=e.open,a=e.setOpen,n=$(),r=function(e,t){"clickaway"!==t&&a(!1)};return c.a.createElement("div",{className:n.root},c.a.createElement(L.a,{anchorOrigin:{vertical:"top",horizontal:"right"},open:t,autoHideDuration:6e3,onClose:r},c.a.createElement(W.a,{onClose:r,severity:"success",elevation:6,variant:"filled"},"Transaction successfully created.")))},M=function(e){var t=new Date(e),a="".concat(t.getMonth()+1),n="".concat(t.getDate()),c=t.getFullYear();return a.length<2&&(a="0".concat(a)),n.length<2&&(n="0".concat(n)),[c,a,n].join("-")},G=Object(h.a)((function(){return{radioGroup:{display:"flex",justifyContent:"center",marginBottom:"-10px"},button:{marginTop:"20px"}}})),z={amount:"",category:"",type:"Income",date:M(new Date)},U=function(){var e=G(),t=Object(n.useContext)(d).addTransaction,a=Object(n.useState)(z),r=Object(i.a)(a,2),o=r[0],u=r[1],m=Object(l.useSpeechContext)().segment,s=c.a.useState(!1),p=Object(i.a)(s,2),y=p[0],b=p[1],E=function(){!Number.isNaN(Number(o.amount))&&o.date.includes("-")&&(C.map((function(e){return e.type})).includes(o.category)?u(Object(D.a)(Object(D.a)({},o),{},{type:"Income"})):T.map((function(e){return e.type})).includes(o.category)&&u(Object(D.a)(Object(D.a)({},o),{},{type:"Expense"})),b(!0),t(Object(D.a)(Object(D.a)({},o),{},{amount:Number(o.amount),id:Object(J.a)()})),u(z))};Object(n.useEffect)((function(){if(m){if("add_expense"===m.intent.intent)u(Object(D.a)(Object(D.a)({},o),{},{type:"Expense"}));else if("add_income"===m.intent.intent)u(Object(D.a)(Object(D.a)({},o),{},{type:"Income"}));else{if(m.isFinal&&"create_transaction"===m.intent.intent)return E();if(m.isFinal&&"cancel_transaction"===m.intent.intent)return u(z)}m.entities.forEach((function(e){var t="".concat(e.value.charAt(0)).concat(e.value.slice(1).toLowerCase());switch(e.type){case"amount":u(Object(D.a)(Object(D.a)({},o),{},{amount:e.value}));break;case"category":C.map((function(e){return e.type})).includes(t)?u(Object(D.a)(Object(D.a)({},o),{},{type:"Income",category:t})):T.map((function(e){return e.type})).includes(t)&&u(Object(D.a)(Object(D.a)({},o),{},{type:"Expense",category:t}));break;case"date":u(Object(D.a)(Object(D.a)({},o),{},{date:e.value}))}})),m.isFinal&&o.amount&&o.category&&o.type&&o.date&&E()}}),[m]);var g="Income"===o.type?C:T;return c.a.createElement(f.a,{container:!0,spacing:2},c.a.createElement(H,{open:y,setOpen:b}),c.a.createElement(f.a,{item:!0,xs:12},c.a.createElement(O.a,{align:"center",variant:"subtitle2",gutterBottom:!0},m?c.a.createElement("div",{className:"segment"},m.words.map((function(e){return e.value})).join(" ")):null)),c.a.createElement(f.a,{item:!0,xs:6},c.a.createElement(A.a,{fullWidth:!0},c.a.createElement(B.a,null,"Type"),c.a.createElement(R.a,{value:o.type,onChange:function(e){return u(Object(D.a)(Object(D.a)({},o),{},{type:e.target.value}))}},c.a.createElement(_.a,{value:"Income"},"Income"),c.a.createElement(_.a,{value:"Expense"},"Expense")))),c.a.createElement(f.a,{item:!0,xs:6},c.a.createElement(A.a,{fullWidth:!0},c.a.createElement(B.a,null,"Category"),c.a.createElement(R.a,{value:o.category,onChange:function(e){return u(Object(D.a)(Object(D.a)({},o),{},{category:e.target.value}))}},g.map((function(e){return c.a.createElement(_.a,{key:e.type,value:e.type},e.type)}))))),c.a.createElement(f.a,{item:!0,xs:6},c.a.createElement(P.a,{type:"number",label:"Amount",value:o.amount,onChange:function(e){return u(Object(D.a)(Object(D.a)({},o),{},{amount:e.target.value}))},fullWidth:!0})),c.a.createElement(f.a,{item:!0,xs:6},c.a.createElement(P.a,{fullWidth:!0,label:"Date",type:"date",value:o.date,onChange:function(e){return u(Object(D.a)(Object(D.a)({},o),{},{date:M(e.target.value)}))}})),c.a.createElement(F.a,{className:e.button,variant:"contained",color:"primary",fullWidth:!0,onClick:E},"Create"))},V=a(414),Y=a(417),q=a(366),K=a(418),Q=a(431),X=a(421),Z=a(422),ee=a(409),te=a(419),ae=a(420),ne=a(423),ce=a(96),re=a(95),oe=Object(h.a)((function(e){return{avatarIncome:{color:"#fff",backgroundColor:ce.a[500]},avatarExpense:{color:e.palette.getContrastText(re.a[500]),backgroundColor:re.a[500]},list:{maxHeight:"150px",overflow:"auto"}}})),le=function(){var e=oe(),t=Object(n.useContext)(d),a=t.transactions,r=t.deleteTransaction;return c.a.createElement(V.a,{dense:!1,className:e.list},a.map((function(t){return c.a.createElement(Y.a,{direction:"down",in:!0,mountOnEnter:!0,unmountOnExit:!0,key:t.id},c.a.createElement(q.a,null,c.a.createElement(K.a,null,c.a.createElement(Q.a,{className:"Income"===t.type?e.avatarIncome:e.avatarExpense},"Income"===t.type?c.a.createElement(te.a,null):c.a.createElement(ae.a,null))),c.a.createElement(X.a,{primary:t.category,secondary:"$".concat(t.amount," - ").concat(t.date)}),c.a.createElement(Z.a,null,c.a.createElement(ee.a,{edge:"end","aria-label":"delete",onClick:function(){return r(t.id)}},c.a.createElement(ne.a,null)))))})))},ie=Math.round(Math.random()),ue=function(){return c.a.createElement("div",{elevation:3,style:{textAlign:"center",padding:"0 10%"}},"Try saying: ",c.a.createElement("br",null),"Add ",ie?"Income ":"Expense ","for ",ie?"$100 ":"$50 ","in Category ",ie?"Salary ":"Travel ","for ",ie?"Monday ":"Thursday ")},me=function(){var e=w(),t=Object(n.useContext)(d).balance;return c.a.createElement(b.a,{className:e.root,raised:!0},c.a.createElement(E.a,{title:"Expense Tracker"}),c.a.createElement(g.a,null,c.a.createElement(O.a,{align:"center",variant:"h5"},"Total Balance $",t),c.a.createElement(O.a,{variant:"subtitle1",style:{lineHeight:"1.5em",marginTop:"20px"}},c.a.createElement(ue,null)),c.a.createElement(k.a,{className:e.divider}),c.a.createElement(U,null)),c.a.createElement(g.a,{className:e.cartContent},c.a.createElement(f.a,{container:!0,spacing:2},c.a.createElement(f.a,{item:!0,xs:12},c.a.createElement(le,null)))))},se=a(21),de=Object(h.a)((function(e){return{desktop:Object(se.a)({},e.breakpoints.up("sm"),{display:"none"}),mobile:Object(se.a)({},e.breakpoints.down("sm"),{display:"none"}),main:Object(se.a)({},e.breakpoints.up("sm"),{paddingBottom:"5%"}),last:Object(se.a)({},e.breakpoints.down("sm"),{marginBottom:e.spacing(3),paddingBottom:"200px"}),grid:{"& > *":{margin:e.spacing(2)}}}})),pe=function(){var e=de(),t=Object(l.useSpeechContext)().speechState,a=Object(n.useRef)(null);return Object(n.useEffect)((function(){t===l.SpeechState.Recording&&a.current.scrollIntoView()}),[t]),c.a.createElement("div",null,c.a.createElement(f.a,{className:e.grid,container:!0,spacing:0,alignItems:"center",justify:"center",style:{height:"100vh"}},c.a.createElement(f.a,{item:!0,xs:12,sm:4,className:e.mobile},c.a.createElement(S,{title:"Income"})),c.a.createElement(f.a,{ref:a,item:!0,xs:12,sm:3,className:e.main},c.a.createElement(me,null)),c.a.createElement(f.a,{item:!0,xs:12,sm:4,className:e.desktop},c.a.createElement(S,{title:"Income"})),c.a.createElement(f.a,{item:!0,xs:12,sm:4,className:e.last},c.a.createElement(S,{title:"Expense"})),c.a.createElement(y.PushToTalkButtonContainer,null,c.a.createElement(y.PushToTalkButton,null))))};a(361);o.a.render(c.a.createElement(l.SpeechProvider,{appId:"7c4aee08-1073-4a32-b862-ebe1850e0732",language:"en-US"},c.a.createElement(p,null,c.a.createElement(pe,null))),document.getElementById("root"))}},[[362,1,2]]]);
//# sourceMappingURL=main.9ad62f00.chunk.js.map