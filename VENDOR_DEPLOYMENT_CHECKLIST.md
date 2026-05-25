# Vendor Implementation - Deployment Checklist

**Status**: Phase 1-8 COMPLETE  
**Date**: 2026-05-25  
**Remaining**: Database migration + Testing + Deployment

---

## Pre-Deployment Checklist

### Code Quality
- [x] All 25 API endpoints created
- [x] Middleware & authentication implemented
- [x] TypeScript types defined
- [x] Error handling in place
- [x] Rate limiting implemented
- [x] Activity logging added
- [ ] Code reviewed by team
- [ ] Linting/formatting complete (run: `npm run lint`)
- [ ] TypeScript compilation (run: `npm run tsc --noEmit`)

### Database
- [ ] Backup existing database
- [ ] Review migration script (09-vendor-complete-schema.sql)
- [ ] Test migration on staging DB
- [ ] Run migration on production:
  ```bash
  psql -U postgres -h localhost -d gharmart < scripts/09-vendor-complete-schema.sql
  ```
- [ ] Verify tables created (check: `\dt` in psql)
- [ ] Verify indexes created
- [ ] Verify RLS policies applied

### Environment Configuration
- [ ] DATABASE_URL is set and correct
- [ ] SESSION_SECRET is set (min 32 chars, random)
- [ ] All env vars exported to production
- [ ] No hardcoded secrets in code

### Dependencies
- [ ] Run: `npm install` to ensure all dependencies installed
- [ ] Verify these are installed:
  - jsonwebtoken
  - bcryptjs
  - pg
  - next

### Security Review
- [ ] All endpoints require authentication
- [ ] Ownership validation prevents cross-vendor access
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (JSON only, no HTML)
- [ ] CSRF tokens if needed
- [ ] Input validation on all endpoints
- [ ] Error messages sanitized
- [ ] Rate limiting functional
- [ ] Activity logging working

### Performance Review
- [ ] Database indexes created on:
  - vendor_id
  - status
  - created_at
  - user_id
- [ ] N+1 queries eliminated
- [ ] Response times tested (< 200ms target)
- [ ] Pagination tested
- [ ] Large dataset handling tested

### Documentation
- [ ] VENDOR_API_DOCUMENTATION.md reviewed
- [ ] VENDOR_IMPLEMENTATION_GUIDE.md reviewed
- [ ] VENDOR_IMPLEMENTATION_SUMMARY.md reviewed
- [ ] Database schema documented
- [ ] API examples tested and working

---

## Testing Checklist

### Unit Tests
- [ ] Create test file: `tests/vendor/middleware.test.ts`
  - Test JWT verification
  - Test ownership validation
  - Test rate limiting
  
- [ ] Create test file: `tests/vendor/auth.test.ts`
  - Test registration validation
  - Test login with valid/invalid credentials
  - Test token generation

- [ ] Create test file: `tests/vendor/products.test.ts`
  - Test product creation
  - Test product update with ownership check
  - Test product deletion

### Integration Tests
- [ ] Test registration → login → product creation flow
- [ ] Test order status update notifications
- [ ] Test payout request with balance validation
- [ ] Test KYC document upload
- [ ] Test support ticket creation
- [ ] Test analytics data retrieval
- [ ] Test promotion creation with validation

### API Testing
Using Postman/Insomnia:
- [ ] Test all 25 endpoints
- [ ] Verify response formats
- [ ] Verify error handling
- [ ] Verify rate limiting
- [ ] Test with invalid tokens
- [ ] Test cross-vendor access attempts (should fail)

### Load Testing
- [ ] Simulate 100 concurrent vendors
- [ ] Simulate 1000 orders per vendor
- [ ] Measure response times
- [ ] Check database connection pool
- [ ] Verify no connection leaks

---

## Deployment Checklist

### Pre-Deployment Build
```bash
# Run these commands
npm run build      # Build project
npm run lint       # Check linting
npm tsc            # Type check
npm run test       # Run tests (if exists)
```

### Database Migration
```bash
# 1. Backup production database
pg_dump -U postgres -h prod-db.example.com gharmart > backup_2026-05-25.sql

# 2. Run migration
psql -U postgres -h prod-db.example.com gharmart < scripts/09-vendor-complete-schema.sql

# 3. Verify migration
psql -U postgres -h prod-db.example.com -d gharmart -c "\dt vendor_*"
psql -U postgres -h prod-db.example.com -d gharmart -c "\dt support_*"
```

### Deploy Code
```bash
# Vercel deployment
vercel deploy --prod

# Or your custom deployment
npm run deploy:prod
```

### Post-Deployment Verification
```bash
# 1. Check health endpoint (create if needed)
curl https://gharmart.com/api/health

# 2. Test registration endpoint
curl -X POST https://gharmart.com/api/vendor/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com",...}'

# 3. Check logs for errors
tail -f /var/log/gharmart/error.log

# 4. Verify database connectivity
# Check connection pool status

# 5. Monitor performance
# Check API response times

# 6. Monitor errors
# Check error tracking (Sentry, etc.)
```

---

## Rollback Plan

If deployment fails:

```bash
# 1. Restore previous code version
git revert <commit-hash>
npm run build
vercel deploy --prod

# 2. If database migration caused issues:
# Restore from backup
psql -U postgres -h prod-db.example.com gharmart < backup_2026-05-25.sql

# 3. Clear cache if using Redis
redis-cli FLUSHALL

# 4. Restart services if needed
systemctl restart app-service
```

---

## Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs for issues
- [ ] Test key workflows manually
- [ ] Check database performance
- [ ] Verify all notifications working
- [ ] Check auth flow with real users

### Week 1
- [ ] Gather vendor feedback
- [ ] Fix any critical bugs
- [ ] Monitor performance metrics
- [ ] Update documentation if needed
- [ ] Plan Phase 2 enhancements

### Ongoing
- [ ] Regular database backups
- [ ] Monitor error rates
- [ ] Review activity logs for suspicious behavior
- [ ] Plan image upload integration
- [ ] Plan email notification service

---

## Known Issues & Workarounds

### Issue: Migration fails with "Table already exists"
**Solution**: Drop old tables and re-run migration
```sql
DROP TABLE IF EXISTS vendor_* CASCADE;
DROP TABLE IF EXISTS support_* CASCADE;
```

### Issue: JWT signature verification fails
**Solution**: Ensure SESSION_SECRET env var is set correctly
```bash
echo $SESSION_SECRET  # Should output your secret
```

### Issue: Bank account verification fails
**Solution**: Verify account number format (10-18 digits)

### Issue: Analytics endpoint is slow with large datasets
**Solution**: Pre-calculate daily aggregates using vendor_analytics_daily table

---

## Contact & Support

For deployment issues:
1. Check logs: `/var/log/gharmart/`
2. Check database: `psql ... -c "SELECT * FROM vendor_kyc_documents LIMIT 1;"`
3. Review error messages in VENDOR_API_DOCUMENTATION.md
4. Contact engineering team

---

**Deployment Status**: READY FOR PRODUCTION

Next: Run database migration → Run tests → Deploy to production
