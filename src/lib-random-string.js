//
// https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
//

//
// upg: test this method agianst 10,000 random numbers from 0-100 to see if even dist count.
//

// 2021.10.03 -- add set (s) param.
const randomString = (n,s)=>{ // upg: allow string set. // upg: allow picking random string by byte size of data.
	n = n || 16
	let b = new Uint8Array(n+1) // extra random value for initial start position
	window.crypto.getRandomValues(b)

	// could use hex
	//https://bitcoin.stackexchange.com/questions/52727/byte-array-to-hexadecimal-and-back-again-in-javascript

	s = s || 'ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuvwxyz01234567890'//-_'

	let aa = []
	let ii = 0
	let len = s.length
	// note: this might be biased? or might be bad to add seq random numbers? 
	for(let i = 0;i< b.length;i++){ // first value (index 0) to start in a random location.
		let v = b[i] 
		ii += v
		if(i > 0){ 
			let iii = ii%len
			let vv = s[iii]
			if(!vv)
				conole.log('out of range?',iii)
			aa.push(vv)
			}
		}//for
	
	let r = aa.join('')

	return r	
	}

//console.log(randomString(100))

export default randomString
