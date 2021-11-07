
$('input[type=radio]').on('click', function(event){

    var val = $(this, ':checked').val();
    console.log(val)
    console.log('classNane')
    console.log(this.className)
    console.log(this.value)
    console.log("this.id")
    console.log(this.id)
    var currPair = this.id 
    var currencyExchange = val
    var baseCurr= 'USD'
    var quoteCurr = currencyExchange.slice(4,7)
    var url =  "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="+ baseCurr + "&to_currency=" +quoteCurr +"&apikey=RQKFECZIU89JZK5T"
    console.log(quoteCurr)
    console.log(url)
    $.get(
    
         "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="+ baseCurr + "&to_currency=" +quoteCurr +"&apikey=RQKFECZIU89JZK5T"
       ,
        function(data,status) {
            // alert("Data: "+ data + "\nStatus: " + status)
        
            console.log(status)
            const info = data[Object.keys(data)[0]]
           console.log(info)
           const baseCurr = info['1. From_Currency Code']
           const quoteCurr = info['3. To_Currency Code']
           var rate = info['5. Exchange Rate']
           var rate_2 = Math.round(rate  * 100) / 100
           console.log(rate_2)
           console.log("Exchange Rate for Currency Pair" + " "+ baseCurr + " "+  "To" + " " +
           quoteCurr + " " + "is " + rate_2) 
           var dataCurr = "Currency Pair" + " "+ baseCurr + " "+  "To" + " " +
           quoteCurr + " " + "is " + rate_2
           var headerdata = "Exchange Rate for " + currPair 

           $('div.modal.fade').attr('id', currPair);;
           $('#' + currPair).find('.modal-content').css("background-color", "yellow");
           $('#'+ currPair).find('.modal-title').text(headerdata);
           $('#'+ currPair).find('.modal-body').text(dataCurr).wrapInner("<strong />");
          
           $('#' + currPair).modal('show')
      
      
    //   console.log(info['5. Exchange Rate'])
    //   const info = data[Object.keys(data)[0]]
    //   var rate = info['5. Exchange Rate']
    //   console.log(Array.from(info))
    //   console.log(data);
     }
     )


   

})
    // }).done(function(yourData) {
     
    //     $('div.modal.fade').attr('id', this.id);
    //     $('#'+ this.id).find('.modal-body').text(yourData);
    //    $('#' + this.id).modal('show')

