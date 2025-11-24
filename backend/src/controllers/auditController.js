const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

// Obtener logs de auditoría con filtros
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      table_name, 
      record_id, 
      action, 
      changed_by, 
      start_date, 
      end_date,
      limit = 100,
      offset = 0 
    } = req.query;

    const where = {};
    
    if (table_name) where.table_name = table_name;
    if (record_id) where.record_id = record_id;
    if (action) where.action = action;
    if (changed_by) where.changed_by = changed_by;
    
    if (start_date || end_date) {
      where.changed_at = {};
      if (start_date) where.changed_at[Op.gte] = new Date(start_date);
      if (end_date) where.changed_at[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['changed_at', 'DESC']]
    });

    res.json({
      total: count,
      logs: rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    res.status(500).json({ message: 'Error al obtener logs de auditoría', error: error.message });
  }
};

// Obtener log específico por ID
exports.getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await AuditLog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!log) {
      return res.status(404).json({ message: 'Log de auditoría no encontrado' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error al obtener log:', error);
    res.status(500).json({ message: 'Error al obtener log de auditoría', error: error.message });
  }
};

// Obtener logs por tabla
exports.getLogsByTable = async (req, res) => {
  try {
    const { table_name } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: { table_name },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['changed_at', 'DESC']]
    });

    res.json({
      table: table_name,
      total: count,
      logs: rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener logs por tabla:', error);
    res.status(500).json({ message: 'Error al obtener logs por tabla', error: error.message });
  }
};

// Obtener logs por registro específico
exports.getLogsByRecord = async (req, res) => {
  try {
    const { table_name, record_id } = req.params;

    const logs = await AuditLog.findAll({
      where: { 
        table_name,
        record_id: parseInt(record_id)
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['changed_at', 'DESC']]
    });

    res.json({
      table: table_name,
      record_id: parseInt(record_id),
      history: logs
    });
  } catch (error) {
    console.error('Error al obtener historial del registro:', error);
    res.status(500).json({ message: 'Error al obtener historial del registro', error: error.message });
  }
};

// Obtener logs por usuario
exports.getLogsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: { changed_by: user_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['changed_at', 'DESC']]
    });

    res.json({
      user_id: parseInt(user_id),
      total: count,
      logs: rows,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener logs por usuario:', error);
    res.status(500).json({ message: 'Error al obtener logs por usuario', error: error.message });
  }
};

// Crear log de auditoría manualmente (para casos especiales)
exports.createAuditLog = async (req, res) => {
  try {
    const { table_name, record_id, action, old_values, new_values, changed_by } = req.body;

    const log = await AuditLog.create({
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      changed_by
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error al crear log de auditoría:', error);
    res.status(500).json({ message: 'Error al crear log de auditoría', error: error.message });
  }
};

// Obtener estadísticas de auditoría
exports.getAuditStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const where = {};
    if (start_date || end_date) {
      where.changed_at = {};
      if (start_date) where.changed_at[Op.gte] = new Date(start_date);
      if (end_date) where.changed_at[Op.lte] = new Date(end_date);
    }

    // Total de logs
    const total = await AuditLog.count({ where });

    // Logs por tabla
    const byTable = await AuditLog.findAll({
      where,
      attributes: [
        'table_name',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['table_name'],
      raw: true
    });

    // Logs por acción
    const byAction = await AuditLog.findAll({
      where,
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['action'],
      raw: true
    });

    // Usuarios más activos
    const topUsers = await AuditLog.findAll({
      where,
      attributes: [
        'changed_by',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      group: ['changed_by', 'user.id', 'user.name', 'user.email'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      total,
      by_table: byTable,
      by_action: byAction,
      top_users: topUsers
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de auditoría', error: error.message });
  }
};
