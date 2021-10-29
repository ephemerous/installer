import fs from 'fs-extra'

;(async n=>{
	const src = './src'
	const dest = './bin'

	const {worker_url} = process.env

	const build = Date.now()+'' /// upg: yyyy-mm-dd-hh-mm
	
	console.log({src,dest,worker_url})

	//upg: clear files in dest

	const r = await fs.copy(src,dest)

	const i = {worker_url,build}

	const fn = dest+'/config.json'
	await fs.writeFile(fn,JSON.stringify(i))

	})();
