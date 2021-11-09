import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
var config = {
    clientid:'907321397716598814',
    secret:'om5sNMYxDaz4lI2WYrzhFBYCOTtEYGRR',
    redirect:'https://registerpythontest.azurewebsites.net/login',
    bot_token:'OTA3MzIxMzk3NzE2NTk4ODE0.YYle5g.fMjZCL-tWxirAJd_sI4dyEFShwQ',
    gid:'907659036546203690',
    cid:'907659194784690206'
};
console.log(config);
import fs from 'fs';
import mysql from 'mysql2';
var app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
import fetch from 'node-fetch';
var channel
import Discord from 'discord.js';
var Intents = Discord.Intents.FLAGS;
var client = new Discord.Client({ intents: [Intents.GUILDS,Intents.GUILD_MEMBERS,Intents.GUILD_MESSAGES,Intents.GUILD_MESSAGES]});
client.on('ready',()=>{
    channel = client.channels.cache.get(config.cid);
    console.log("ready");
})
client.login(process.env.token);
console.log(process.env.secret);

app.use(cookieParser());
app.get('/',(req,res)=>{
    if(req.cookies!==undefined)
    {
        if(req.cookies.token!==undefined)
        {
            var access = verifyaccess(req.cookies.token,(access)=>{
            console.log(access.ok);
            if(access.ok)
            {
                var file = fs.readFileSync('./login.html').toString();
                file = file.replace('!!!_YOURNAME_!!!',access.name);
                if(!(access.sent))
                    res.send(file);
            }
            else
            {
                res.send(fs.readFileSync('./not_login.html').toString()) 
            }
        });
        }
        else
        {
            console.log("tutej");
            res.send(fs.readFileSync('./not_login.html').toString()) 
        }
    }
    else
    {
        var response = fs.readFileSync('./not_login.html').toString();
        res.send(response)
    }
});
app.post('/',(req,res)=>{
    if(req.cookies!==undefined)
    {
        if(req.cookies.token!==undefined)
        {
            var access = verifyaccess(req.cookies.token,(access)=>{
            console.log(access.ok);
            if(access.ok&&!(access.sent))
            {
                dbregister(req.cookies.token,access.id,req.body.name,(result)=>{
                    if(result)
                    {
                        res.send("ok");
                    }
                    else
                    {
                        res.send("spróbuj ponownie");
                    }
                })
            }
            else
            {
                res.send(fs.readFileSync('./not_login.html').toString()) 
            }
        });
        }
        else
        {
            console.log("tutej");
            res.send(fs.readFileSync('./not_login.html').toString()) 
        }
    }
    else
    {
        var response = fs.readFileSync('./not_login.html').toString();
        res.send(response)
    }
})
app.get('/login',async (req,res)=>{
    if(req.query.code)
    {
        try {
			const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: config.clientid,
					client_secret: config.secret,
					grant_type: 'authorization_code',
                    code:req.query.code,
					redirect_uri: config.redirect,
					scope: 'identify',
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await oauthResult.json();
            if(oauthData.error!==undefined&&oauthResult.scope!=='identify email connections guilds guilds.join')
            {
                res.send("error try again");
            }
            else
            {
                
                res.cookie('token',oauthData.access_token,{maxAge:parseInt(oauthData.expires_in)*1000});
                res.send("Gotowe <a href='/'>Przejdź żeby ustawić swoją nazwę minecraft</a>")
            }
            
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error;
			// it will return a 401 Unauthorized response in the try block above
			console.error(error);
		}
    }
    else
    {
        res.send("not work")
    }
})
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening!'));
async function verifyaccess(token,callback)
{
var name = null;
var ok = false;
var id = null;
var sent=false;
    try {
        const oauthResult = await fetch('https://discord.com/api/oauth2/@me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':'Bearer '+token
            },
        });

        const oauthData = await oauthResult.json();
        console.log(oauthData);
        if(oauthData.code==0&&oauthData["application"]["id"]!=='907321397716598814')
        {
            console.log(oauthData);
            callback({ok:ok,name:name,id:id,sent:sent});
            sent=true;
        }
        else
        {
            name=oauthData.user.username;
            id=oauthData.user.id;
            try {
                const oauthResult = await fetch('https://discord.com/api/users/@me/guilds', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization':'Bearer '+token
                    },
                });
        
                const oauthData = await oauthResult.json();
                    if(oauthData.find(element=>element.id==='695225372265939015')!==undefined)
                    {
                        ok = true;
                        callback({ok:ok,name:name,id:id,sent:sent});
                        sent=true;
                    }
                    else
                    {
                        callback({ok:ok,name:name,id:id,sent:sent});
                        sent=true;
                    }
                    
                
            } catch (error) {
                // NOTE: An unauthorized token will not throw an error;
                // it will return a 401 Unauthorized response in the try block above
                console.error(error);
                callback({ok:ok,name:name,id:id,sent:sent});
                sent=true;
            }
        }
        
    } catch (error) {
        // NOTE: An unauthorized token will not throw an error;
        // it will return a 401 Unauthorized response in the try block above
        console.error(error);
        callback({ok:ok,name:name,id:id,sent:sent});
        sent=true;
    }
    
}
async function dbregister(token,id,name,callback)
{
    console.log({token:token,id:id,name:name})
    try
    {
        try {
            const args = JSON.stringify({
                access_token:token,
                nick:name
            });
			const oauthResult = await fetch(`https://discord.com/api/guilds/${config.gid}/members/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization':'Bot '+config.bot_token,
				},
                body:args,
                
			});
            
			const oauthData = await oauthResult;
           if(oauthData.status==204)
           {
               callback(false)
           }
           else
           {
            try {
                const oauthResult = await fetch('https://discord.com/api//users/@me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization':'Bearer '+token
                    },
                });
        
                const oauthData = await oauthResult.json();
                console.log(oauthData);
                var embed = new Discord.MessageEmbed()
                .setTitle("Nowy zapisany")
                .addFields([{name:"Mc name",value:name,inline:true},{name:"ID",value:id,inline:true},{name:"e-mail",value:oauthData.email,inline:true}])
                .setTimestamp(new Date())
                channel.send({embeds:[embed]}).then(async message=>{callback(true)})
                
            } catch (error) {
                // NOTE: An unauthorized token will not throw an error;
                // it will return a 401 Unauthorized response in the try block above
                console.error(error);
            }
           }

            
		} catch (error) {
			// NOTE: An unauthorized token will not throw an error;
			// it will return a 401 Unauthorized response in the try block above
			console.error(error);

		}
}
catch(error)
{
    console.log(error)
    callback(false)
}

}