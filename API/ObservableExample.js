var innerObservable = new Observable(observer => {
    console.log('Inner observable call failed');
    observer.error(new Error('Call failed!'));
})


var outerObservable = new Observable(observer => {
    innerObservable.subscribe(
        data => {
            observer.next(data);
            observer.onCompleted();
        },
        err => {
            //observer.throw(err); // `console.error` doesn't get called
            observer.error(err);  //// `console.error` it's called
        }
    )
});

outerObservable.subscribe(
    next => {
        console.log('ok!');
    }
    , err => {
        console.error('error');
    }
    , () => {
        console.log('done');
    }
);