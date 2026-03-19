/**
 * POST /api/companions/[id]/claim
 *
 * The most important UX moment in Galatea.
 *
 * A human permanently claims a companion. Once claimed:
 * - status → 'claimed', owner set, claimed_at set
 * - Companion is removed from the wild (no longer browsable)
 * - Soul stack artifacts are recorded (soul_md, skill_md, system_prompt)
 * - Web3: in production, this triggers NFT mint + IPFS upload
 *   (stubs provided here — connect your contract/IPFS layer)
 *
 * This operation is IRREVERSIBLE by design.
 * Smart contract enforces 1:1 — a companion can never be claimed again.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  // owner_id: wallet address (ETH) or user email — whatever identifies the human
  const ownerId = typeof b.owner_id === "string" ? b.owner_id.trim() : null
  if (!ownerId) {
    return NextResponse.json({ error: "owner_id is required" }, { status: 400 })
  }

  const supabase = await createClient()

  // --- Load companion — must exist and be wild ---
  const { data: companion, error: fetchError } = await supabase
    .from("companions")
    .select("id, name, status, soul_md, skill_md, system_prompt")
    .eq("id", id)
    .single()

  if (fetchError || !companion) {
    return NextResponse.json({ error: "Companion not found" }, { status: 404 })
  }

  if (companion.status !== "wild") {
    return NextResponse.json(
      { error: "This companion has already been claimed. Every companion is unique and belongs to one person." },
      { status: 409 }
    )
  }

  // --- Web3 stubs ---
  // In production: call your NFT contract + IPFS upload here.
  // These return real values when a contract is wired up.
  const nftTokenId = await mintNFT(companion.id, ownerId)
  const { soulCid, skillCid } = await uploadToIPFS(companion.soul_md, companion.skill_md)

  // --- Mark as claimed (atomic) ---
  const { data: claimed, error: claimError } = await supabase
    .from("companions")
    .update({
      status: "claimed",
      owner_id: ownerId,
      claimed_at: new Date().toISOString(),
      nft_token_id: nftTokenId,
      nft_contract: process.env.NFT_CONTRACT_ADDRESS ?? null,
      ipfs_soul_cid: soulCid,
      ipfs_skill_cid: skillCid,
    })
    .eq("id", id)
    .eq("status", "wild")   // double-check: prevent race conditions
    .select()
    .single()

  if (claimError || !claimed) {
    // Could be a race — another request claimed it milliseconds before
    return NextResponse.json(
      { error: "Claim failed — the companion may have just been claimed by someone else." },
      { status: 409 }
    )
  }

  // Return the full soul stack so the user can download/self-host their companion
  return NextResponse.json({
    success: true,
    companion: {
      id: claimed.id,
      name: claimed.name,
      claimed_at: claimed.claimed_at,
      owner_id: claimed.owner_id,
      nft_token_id: claimed.nft_token_id,
      nft_contract: claimed.nft_contract,
    },
    // The soul stack — everything the user owns
    soul_stack: {
      soul_md: companion.soul_md,
      skill_md: companion.skill_md,
      system_prompt: companion.system_prompt,
      ipfs_soul_cid: soulCid,
      ipfs_skill_cid: skillCid,
    },
    message: `${companion.name} is now yours. They will only talk to you.`,
  })
}

// ---------------------------------------------------------------------------
// Web3 stubs — replace with real implementations
// ---------------------------------------------------------------------------

async function mintNFT(companionId: string, ownerId: string): Promise<string | null> {
  // TODO: call your ERC-721 contract's mint(ownerId, companionId) function
  // using ethers.js or viem. Return the token ID.
  //
  // Example:
  //   const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer)
  //   const tx = await contract.mint(ownerId, companionId)
  //   const receipt = await tx.wait()
  //   return receipt.events[0].args.tokenId.toString()
  if (process.env.NODE_ENV === "production") {
    console.warn("[claim] NFT minting not yet wired up — set up your ERC-721 contract")
  }
  return `stub:${companionId.slice(0, 8)}`
}

async function uploadToIPFS(
  soulMd: string,
  skillMd: string
): Promise<{ soulCid: string | null; skillCid: string | null }> {
  // TODO: upload to IPFS via web3.storage, Pinata, or your own node.
  // Return the CIDs so the user has permanent access to their soul artifacts.
  //
  // Example with web3.storage:
  //   const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN })
  //   const soulFile = new File([soulMd], 'soul.md', { type: 'text/markdown' })
  //   const soulCid = await client.put([soulFile])
  //   ...
  if (process.env.NODE_ENV === "production") {
    console.warn("[claim] IPFS upload not yet wired up — configure your IPFS provider")
  }
  return { soulCid: null, skillCid: null }
}
