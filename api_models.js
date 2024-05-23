const Sequelize = require('sequelize');
const pg = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config()

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialectModule: pg
})

const getCurrentTimeStamp = () => {
	var d = new Date(0);
	d.setUTCSeconds(Date.now() / 1000);
	return d;
}

const User = sequelize.define('user', {
	id: { type: Sequelize.STRING, primaryKey: true },
	first_name: Sequelize.STRING,
	last_name: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	created_at: Sequelize.DATE,
	status: Sequelize.STRING,
	last_active_at: Sequelize.DATE,
	subscription_tier: Sequelize.STRING,
	subscription_status: Sequelize.STRING,
	org: Sequelize.ARRAY({ type: Sequelize.STRING, }),
	team: Sequelize.ARRAY({ type: Sequelize.STRING }),
	project: Sequelize.ARRAY({ type: Sequelize.STRING })
}, {
	hooks: {
		beforeCreate: (user) => {
			const salt = bcrypt.genSaltSync(10);
			user.password = bcrypt.hashSync(user.password ? user.password : '~~~~~~~~', salt);
			user.id = uuidv4();
			user.last_active_At = getCurrentTimeStamp();
			user.subscription_tier = user.subscription_tier || 'free'
			user.subscription_status = user.subscription_status || 'not-paid'
			user.org = user.org || []
			user.team = user.team || []
			user.project = user.project || []
		}
	}
});

const LoginToken = sequelize.define('loginToken', {
	token: { type: Sequelize.STRING, primaryKey: true, unique: true },
	date_created: Sequelize.DATE,
	user: { type: Sequelize.STRING, references: { model: User, key: 'id' } },
	short_code: Sequelize.STRING,
	used: Sequelize.BOOLEAN
}, {
	hooks: {
		beforeCreate: (loginToken) => {
			loginToken.date_created = getCurrentTimeStamp()
		}
	}
});

const ResetPasswordToken = sequelize.define('resetPasswordToken', {
	token: { type: Sequelize.STRING, primaryKey: true, unique: true },
	date_created: Sequelize.DATE,
	user: { type: Sequelize.STRING, references: { model: User, key: 'id' } },
	short_code: Sequelize.STRING,
	used: Sequelize.BOOLEAN
});

const VerifyAccountToken = sequelize.define('verifyAccountToken', {
	token: { type: Sequelize.STRING, primaryKey: true, unique: true },
	date_created: Sequelize.DATE,
	user: { type: Sequelize.STRING, references: { model: User, key: 'id' } },
}, {
	hooks: {
		beforeCreate: (verifyAccountToken) => {
			verifyAccountToken.token = uuidv4()
			verifyAccountToken.date_created = getCurrentTimeStamp()
		}
	}
});

const Session = sequelize.define('session', {
	token: { type: Sequelize.STRING, allowNull: false },
	user_id: { type: Sequelize.STRING, allowNull: false, references: { model: User, key: 'id' } }
});

sequelize.sync({ alter: true })
	.then(() => console.log('Tables have been successfully updated, if one doesn\'t exist'))
	.catch(error => console.log('An error occurred while creating the table:', error));

module.exports = {
	sequelize,
	User,
	LoginToken,
	ResetPasswordToken,
	Session,
	VerifyAccountToken,
	getCurrentTimeStamp
}