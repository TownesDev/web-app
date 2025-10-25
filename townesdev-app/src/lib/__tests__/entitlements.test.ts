import {
  ensureClientAsset,
  ensureFeature,
  mapPlanToFeature,
} from '@/lib/entitlements'

// Mock Sanity client helpers
jest.mock('@/lib/client', () => {
  return {
    runQuery: jest.fn(),
    sanityWrite: { mutate: jest.fn() },
  }
})

import { runQuery, sanityWrite } from '@/lib/client'

describe('entitlements helpers', () => {
  beforeEach(() => {
    ;(runQuery as jest.Mock).mockReset()
    ;(sanityWrite.mutate as jest.Mock).mockReset()
  })

  describe('mapPlanToFeature', () => {
    it('maps webapp tiers correctly', () => {
      expect(mapPlanToFeature('plan.webapp-starter')).toMatchObject({
        assetType: 'web_app',
        key: 'tier.starter',
      })
      expect(mapPlanToFeature('plan.webapp-pro')).toMatchObject({
        assetType: 'web_app',
        key: 'tier.pro',
      })
      expect(mapPlanToFeature('plan.webapp-plus')).toMatchObject({
        assetType: 'web_app',
        key: 'tier.plus',
      })
    })

    it('maps discord tiers correctly', () => {
      expect(mapPlanToFeature('plan.discord-bronze')).toMatchObject({
        assetType: 'discord_bot',
        key: 'tier.bronze',
      })
      expect(mapPlanToFeature('plan.discord-silver')).toMatchObject({
        assetType: 'discord_bot',
        key: 'tier.silver',
      })
      expect(mapPlanToFeature('plan.discord-gold')).toMatchObject({
        assetType: 'discord_bot',
        key: 'tier.gold',
      })
    })

    it('returns null for unknown ids', () => {
      expect(mapPlanToFeature('plan.unknown')).toBeNull()
    })
  })

  describe('ensureClientAsset', () => {
    it('creates deterministic asset when missing', async () => {
      ;(runQuery as jest.Mock).mockResolvedValueOnce(null)
      ;(sanityWrite.mutate as jest.Mock).mockResolvedValueOnce(true)

      const result = await ensureClientAsset('client123', 'web_app')
      expect(result).toEqual({ _id: 'asset.client123.web_app' })

      expect(sanityWrite.mutate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            createIfNotExists: expect.objectContaining({
              _id: 'asset.client123.web_app',
              _type: 'serviceAsset',
              type: 'web_app',
            }),
          }),
        ])
      )
    })
  })

  describe('ensureFeature', () => {
    it('creates deterministic feature when missing', async () => {
      ;(runQuery as jest.Mock).mockResolvedValueOnce(null)
      ;(sanityWrite.mutate as jest.Mock).mockResolvedValueOnce(true)

      const mapping = {
        planId: 'plan.webapp-pro',
        assetType: 'web_app' as const,
        key: 'tier.pro',
        name: 'Web App Tier: Pro',
        summary: 'desc',
      }

      const result = await ensureFeature(mapping)
      expect(result).toEqual({ _id: 'feature.web_app.tier.pro' })

      expect(sanityWrite.mutate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            createIfNotExists: expect.objectContaining({
              _id: 'feature.web_app.tier.pro',
              _type: 'feature',
              assetType: 'web_app',
              key: 'tier.pro',
              configKey: 'tier.pro',
              isPrivate: true,
            }),
          }),
        ])
      )
    })
  })
})
