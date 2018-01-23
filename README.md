

### Project Description ###

* To supply one framework to run processes concurrently
* To update multi onboarding customers profiles at one time
* NodeJS child-processes based
* MaxProcess is 12 for Windows, 6 for Linux

### Commands ###
* Select applications to run

      >> node propeltool.js configApp -D debug
      
* Run application for one Propel customer

      >> node propeltool.js reviewOne -f [file.xlsx| failedCases.json] -D debug

* Run application for all Propel customers

      >> node propeltool.js reviewAll -f [file.xlsx| failedCases.json] -D debug
      
* Run application to restart aggregations for multi customers

      - Prepare excel with correct orgadmin and password      
      - Update required suppliers here: config/C_restart_aggregation_List.json      
      >> node propeltool.js reviewAll -f [file.xlsx | failedCases.json] -D debug

* Help

      >> node propeltool.js --help
      >> node propeltool.js reviewOne --help
      >> node propeltool.js reviewAll --help

### Pre-requisite ###

* Dev IDE:
    
      1) Install Node js

      2) (Windows Only) git 
      
      3) (Windows Only) Set npm proxy: https://jjasonclark.com/how-to-setup-node-behind-web-proxy/

      4) (Linux Only) Install google-Chrome browser with Yum

      5) (Windows Only) Install Browser Driver for phantomjs, and config PATH in PC. Ref to: http://www.seleniumhq.org/download/
      
      6) Install Browser Driver for chrome, and config PATH in PC. Ref to: http://www.seleniumhq.org/download/
 
* Git commands:

      1) Config ssh key in github server
    
      2) >> git clone [project]
    
      3) >> git submodule init & git submodule update

* Install packages:

      1) >> npm install

* Network connection with prop-idm or ft1 server

      1. Add SSL cert into chrome browser:   

        >> openssl s_client -connect SERVER_DOMAIN:9000 </dev/null 

        - copy output content from -----BEGIN CERTIFICATE----- to -----END CERTIFICATE-----

        >> cd /etc/ssl/certs

        - create a new *.cert file (e.g. prople.cert) and paste content into it.

        >> certutil -d sql:$HOME/.pki/nssdb -L

        >> certutil -d sql:$HOME/.pki/nssdb -A -t "CP,," -n <certificate nickname> -i /etc/ssl/certs/propel.cert
     
      2. [Only for FT1 Server]
   
        1) [Linux] vim /etc/hosts     
            >> [vim] /etc/hosts
            >> [add] 15.140.130.82 pln-cd1-ewebportal.ft1core.mcloud.entsvcs.net
            >> unset http_proxy
            >> unset https_proxy       

        2) [Windows OS] 
            >> [cd ] C:\Windows\System32\drivers\etc\hosts     
            >> [add] 15.140.130.82 pln-cd1-ewebportal.ft1core.mcloud.entsvcs.net
            >> Direct connect setting for Browser

        3) edit config/config.json in scripts
            >> chromeNoProxy
            or
            >> chromeHeadlessNoProxy
            
### References ### 
* [Propel Permissions vs Roles mapping table][1]



[1]: https://hpe.sharepoint.com/teams/VPCRNDANDYTEAM/Projects/Forms/AllItems.aspx?RootFolder=%2Fteams%2FVPCRNDANDYTEAM%2FProjects%2FCustomer%20Onboarding&FolderCTID=0x012000D69C9CCC00CC944CB811C1471732DFF3&View=%7B659291DE-7775-44E0-BF04-25ED624D5F61%7D
