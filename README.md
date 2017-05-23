1. Start monogod server and set path where db files will be craeted
   mongod --dbpath "C:\Users\rana11\Desktop\MentorMentee\DB"

2. For importing files 

mongoimport --db mentorMentee --collection logins  --drop --file C:/Users/rana11/Desktop/MentorMentee/xt_jan_2017_mentor_mentee/data/json_files/login.json

mongoimport --db mentorMentee --collection admins  --drop --file C:/Users/rana11/Desktop/MentorMentee/xt_jan_2017_mentor_mentee/data/json_files/admin.json

mongoimport --db mentorMentee --collection supervisors  --drop --file C:/Users/rana11/Desktop/MentorMentee/xt_jan_2017_mentor_mentee/data/json_files/supervisor.json

mongoimport --db mentorMentee --collection supervisees  --drop --file C:/Users/rana11/Desktop/MentorMentee/xt_jan_2017_mentor_mentee/data/json_files/supervisee.json

Mongod server will be started at 10.150.222.72:27017 , start accessing it using 10.150.222.72:27017/mentorMentee