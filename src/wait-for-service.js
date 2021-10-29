const body = n=>
`
<style>
	main {height: 100%; display: grid; text-align: center; place-items: center;}
	.section {margin-left: 25px;}
	a {display: inline-block; padding: 12px;}

	h1 {color: #eee;}

	.split {opacity: 0.65; font-size: 75%;}

</style>
<main>
	<div>
		<h1>Installed</h1>

		<h3>Waiting for service</h3>
	</div>
</main>
`


class Setup {
	constructor(opts){
		
		opts = opts || {}
		const {api,checkUrl} = opts

		const u = checkUrl

		const dom = document.createElement('main')
		dom.innerHTML = body()

		// ------------------------
		let tc = 0
		const tick = async n=>{
			tc++

			if(tc == 15){
				console.log('unexpected delay')
				const d = document.createElement('div')
				d.textContent = 'sometimes this takes a minute or so.'

				dom.appendChild(d)
				//return
				//temp
				//window.location = 'http://localhost:5555/phone/v1/static'
				}
		
			const tryAgain = n=>{
				setTimeout(tick,3000)
				 }

			try {
				const f = await fetch(u)
				if(f.ok){
					console.log('Ready!')
					const d = await f.text()
					console.log('ddddd',d)
					//console.log(Array.from(d.headers.entries()))
					const ee = new CustomEvent('ready')
					dom.dispatchEvent(ee)
					}
				else {
					console.log('not ok?',)
					tryAgain()
					}
				}
			catch(e){
				console.log('not available:',u,e)
				tryAgain()
				}
			}//func

		tick()


		return dom

		}//func
	}//class

export default Setup
