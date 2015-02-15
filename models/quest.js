module.exports = function(sequelize, DataTypes) {
    var Quest = sequelize.define('Quest', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                Quest.belongsTo(models.User, {as: 'Owner'});
                Quest.belongsToMany(models.User, {through: 'UsersQuests'});
            }
        }
    });
    return Quest;
};
