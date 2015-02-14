module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 1
        },
        experience: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        }
    });
    return User;
};
